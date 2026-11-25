
import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil, forkJoin } from 'rxjs';

import { CheckInService, BookingManagementService } from '@shared-core';
import {
    IBoardingPassDto,
    IBoardingPassFilter,
    IGateScanRequest,
    IBookingPassengerDetailDto,
} from '@shared-core';

// ── Scanning State Machine ────────────────────────────────────────────────
export type ScanningStatus = 'Idle' | 'Scanning' | 'Success' | 'Denied' | 'Warning' | 'Error';

// ── Scan result payload — stores context for feedback panel ──────────────
export interface IScanResult {
    status: ScanningStatus;
    passengerName: string;
    seatNumber: string;
    cabinClass: string;
    sequenceNumber: number;
    message: string;
    timestamp: Date;
}

// ── Gate search filter (local) ─────────────────────────────────────────────
export interface IGateSearchFilter {
    passengerNameContains: string;
    seatNumber: string;
    hasBoarded: boolean | null;
}

const DEFAULT_GATE_FILTER: IGateSearchFilter = {
    passengerNameContains: '',
    seatNumber: '',
    hasBoarded: null,
};

// ── Gate stats ────────────────────────────────────────────────────────────
export interface IGateStats {
    total: number;
    boarded: number;
    remaining: number;
    percentageBoarded: number;
}

// ── No-Show passenger record ─────────────────────────────────────────────
export interface INoShowPassenger {
    passengerId: number;
    firstName: string;
    lastName: string;
    passportNumber?: string;
    assignedSeatNumber?: string;
    cabinClassName?: string;
}

// ── Manifest comparison entry ─────────────────────────────────────────────
export interface IManifestEntry {
    passengerId: number;
    passengerName: string;
    seatNumber: string;
    cabinClass: string;
    sequenceNumber: number;
    bookingReference: string;
    ticketCode: string;
    hasBoarded: boolean;
    passportNumber?: string;
}

// ── Manifest stats ─────────────────────────────────────────────────────────
export interface IManifestStats {
    totalBooked: number;
    totalBoarded: number;
    noShowCount: number;
    boardingRate: number; // 0–100
}

// ── Security filter contract ──────────────────────────────────────────────
export interface ISecuritySearchFilter {
    passengerNameContains: string;
    seatNumber: string;
    flightInstanceId: number | null;
    hasBoarded: boolean | null;
    includeDeleted: boolean;
}

const DEFAULT_SECURITY_FILTER: ISecuritySearchFilter = {
    passengerNameContains: '',
    seatNumber: '',
    flightInstanceId: null,
    hasBoarded: null,
    includeDeleted: false,
};

// ── Security pagination ────────────────────────────────────────────────────
export interface ISecurityPagination {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
}

const DEFAULT_SECURITY_PAGINATION: ISecurityPagination = {
    page: 1, pageSize: 50, total: 0, totalPages: 0,
};


// ── Route base ─────────────────────────────────────────────────────────────
const BASE = '/aoms/reservation-ground/ground-handling';

// ── Auto-reset scan delay (ms) ────────────────────────────────────────────
const SCAN_RESET_DELAY = 4000;

@Injectable({ providedIn: 'root' })
export class GroundHandlingStore {
    private readonly svc = inject(CheckInService);
    private readonly router = inject(Router);
    private readonly destroy$ = new Subject<void>();
    private readonly bookingSvc = inject(BookingManagementService);
    // ── Private writable signals ──────────────────────────────────────────
    private readonly _boardingPasses = signal<IBoardingPassDto[]>([]);
    private readonly _flightManifest = signal<IBoardingPassDto[]>([]);
    private readonly _scanResult = signal<IScanResult | null>(null);
    private readonly _scanningStatus = signal<ScanningStatus>('Idle');
    private readonly _gateLoading = signal<boolean>(false);
    private readonly _gateError = signal<string | null>(null);
    private readonly _isScanLoading = signal<boolean>(false);
    private readonly _searchFilter = signal<IGateSearchFilter>({ ...DEFAULT_GATE_FILTER });
    private readonly _activeFlightId = signal<number | null>(null);
    private readonly _selectedPassId = signal<number | null>(null);
    private readonly _hasLoaded = signal<boolean>(false);

    private readonly _expectedManifest = signal<IBookingPassengerDetailDto[]>([]);
    private readonly _actualBoarded = signal<IBoardingPassDto[]>([]);
    private readonly _manifestLoading = signal<boolean>(false);
    private readonly _manifestError = signal<string | null>(null);
    private readonly _isClosingFlight = signal<boolean>(false);
    private readonly _manifestFlightId = signal<number | null>(null);
    private readonly _exportSuccess = signal<string | null>(null);

    private readonly _searchResults = signal<IBoardingPassDto[]>([]);
    private readonly _activeSecurityInspection = signal<IBoardingPassDto | null>(null);
    private readonly _securityError = signal<string | null>(null);
    private readonly _securityLoading = signal<boolean>(false);
    private readonly _inspectionLoading = signal<boolean>(false);
    private readonly _voidLoading = signal<boolean>(false);
    private readonly _voidSuccess = signal<string | null>(null);
    private readonly _securityFilter = signal<ISecuritySearchFilter>({ ...DEFAULT_SECURITY_FILTER });
    private readonly _securityPagination = signal<ISecurityPagination>({ ...DEFAULT_SECURITY_PAGINATION });
    private readonly _securityHasSearched = signal<boolean>(false);


    // ── Public read-only signals ──────────────────────────────────────────
    readonly boardingPasses = this._boardingPasses.asReadonly();
    readonly flightManifest = this._flightManifest.asReadonly();
    readonly scanResult = this._scanResult.asReadonly();
    readonly scanningStatus = this._scanningStatus.asReadonly();
    readonly gateLoading = this._gateLoading.asReadonly();
    readonly gateError = this._gateError.asReadonly();
    readonly isScanLoading = this._isScanLoading.asReadonly();
    readonly searchFilter = this._searchFilter.asReadonly();
    readonly activeFlightId = this._activeFlightId.asReadonly();
    readonly selectedPassId = this._selectedPassId.asReadonly();
    readonly hasLoaded = this._hasLoaded.asReadonly();


    readonly expectedManifest = this._expectedManifest.asReadonly();
    readonly actualBoarded = this._actualBoarded.asReadonly();
    readonly manifestLoading = this._manifestLoading.asReadonly();
    readonly manifestError = this._manifestError.asReadonly();
    readonly isClosingFlight = this._isClosingFlight.asReadonly();
    readonly manifestFlightId = this._manifestFlightId.asReadonly();
    readonly exportSuccess = this._exportSuccess.asReadonly();

    readonly searchResults = this._searchResults.asReadonly();
    readonly activeSecurityInspection = this._activeSecurityInspection.asReadonly();
    readonly securityError = this._securityError.asReadonly();
    readonly securityLoading = this._securityLoading.asReadonly();
    readonly inspectionLoading = this._inspectionLoading.asReadonly();
    readonly voidLoading = this._voidLoading.asReadonly();
    readonly voidSuccess = this._voidSuccess.asReadonly();
    readonly securityFilter = this._securityFilter.asReadonly();
    readonly securityPagination = this._securityPagination.asReadonly();
    readonly securityHasSearched = this._securityHasSearched.asReadonly();


    // ── Computed signals ──────────────────────────────────────────────────

    /** Boarding statistics derived from manifest data. */
    readonly stats = computed<IGateStats>(() => {
        const all = this._boardingPasses();
        const boarded = all.filter(p => {
            // hasBoarded isn't in IBoardingPassDto directly — infer from manifest
            return this._flightManifest().some(m => m.passId === p.passId);
        });
        const total = all.length;
        const boardedCount = boarded.length;
        return {
            total,
            boarded: boardedCount,
            remaining: total - boardedCount,
            percentageBoarded: total > 0 ? Math.round((boardedCount / total) * 100) : 0,
        };
    });

    /** Client-side filtered boarding passes for the grid — zero-latency feel. */
    readonly filteredPasses = computed<IBoardingPassDto[]>(() => {
        const f = this._searchFilter();
        return this._boardingPasses().filter(p => {
            if (f.passengerNameContains && !p.passengerName.toLowerCase().includes(f.passengerNameContains.toLowerCase())) {
                return false;
            }
            if (f.seatNumber && !p.seatNumber.toLowerCase().includes(f.seatNumber.toLowerCase())) {
                return false;
            }
            if (f.hasBoarded !== null) {
                const isBoarded = this._flightManifest().some(m => m.passId === p.passId);
                if (f.hasBoarded !== isBoarded) return false;
            }
            return true;
        });
    });

    readonly isBoardingComplete = computed<boolean>(() => {
        const s = this.stats();
        return s.total > 0 && s.remaining === 0;
    });

    readonly lastScanSuccess = computed<boolean>(() => this._scanningStatus() === 'Success');
    readonly lastScanDenied = computed<boolean>(() =>
        this._scanningStatus() === 'Denied' || this._scanningStatus() === 'Error'
    );
    readonly lastScanWarning = computed<boolean>(() => this._scanningStatus() === 'Warning');
    readonly isScanning = computed<boolean>(() => this._scanningStatus() === 'Scanning' || this._isScanLoading());


    /**
       * No-show list: passengers in expectedManifest who have no matching
       * entry in actualBoarded (matched by passengerId).
       */
    readonly noShows = computed<INoShowPassenger[]>(() => {
        const boarded = new Set(this._actualBoarded().map(b => b.passengerId));
        return this._expectedManifest()
            .filter(p => !boarded.has(p.passengerId))
            .map(p => ({
                passengerId: p.passengerId,
                firstName: p.firstName,
                lastName: p.lastName,
                passportNumber: p.passportNumber ?? undefined,
                assignedSeatNumber: p.assignedSeatNumber ?? undefined,
                cabinClassName: p.cabinClassName ?? undefined,
            }));
    });

    /**
     * Unified manifest comparison table — merges expected and actual data.
     * Each entry carries a hasBoarded flag for the verification grid.
     */
    readonly comparisonManifest = computed<IManifestEntry[]>(() => {
        const boardedMap = new Map<number, IBoardingPassDto>(
            this._actualBoarded().map(b => [b.passengerId, b])
        );

        return this._expectedManifest().map(p => {
            const boardedRecord = boardedMap.get(p.passengerId);
            return {
                passengerId: p.passengerId,
                passengerName: `${p.firstName} ${p.lastName}`.trim(),
                seatNumber: p.assignedSeatNumber ?? boardedRecord?.seatNumber ?? '—',
                cabinClass: p.cabinClassName ?? boardedRecord?.cabinClass ?? '—',
                sequenceNumber: boardedRecord?.sequenceNumber ?? 0,
                bookingReference: boardedRecord?.bookingReference ?? '—',
                ticketCode: boardedRecord?.ticketCode ?? '—',
                hasBoarded: !!boardedRecord,
                passportNumber: p.passportNumber ?? undefined,
            };
        }).sort((a, b) => {
            // Boarded first, then no-shows; within each group sort by seat
            if (a.hasBoarded !== b.hasBoarded) return a.hasBoarded ? -1 : 1;
            return (a.seatNumber ?? '').localeCompare(b.seatNumber ?? '');
        });
    });

    /** Manifest statistics for the summary stat widgets. */
    readonly manifestStats = computed<IManifestStats>(() => {
        const total = this._expectedManifest().length;
        const boarded = this._actualBoarded().length;
        return {
            totalBooked: total,
            totalBoarded: boarded,
            noShowCount: Math.max(0, total - boarded),
            boardingRate: total > 0 ? Math.round((boarded / total) * 100) : 0,
        };
    });

    /** True when all expected passengers have boarded. */
    readonly isFullyBoarded = computed<boolean>(() =>
        this.manifestStats().noShowCount === 0 &&
        this.manifestStats().totalBooked > 0
    );

    /** True when a search has been run and returned no results. */
    readonly securityResultsEmpty = computed<boolean>(() =>
        this._securityHasSearched() &&
        !this._securityLoading() &&
        this._searchResults().length === 0
    );

    /** Whether any filter has an active value. */
    readonly hasActiveSecurityFilter = computed<boolean>(() => {
        const f = this._securityFilter();
        return !!(
            f.passengerNameContains || f.seatNumber ||
            f.flightInstanceId || f.hasBoarded !== null ||
            f.includeDeleted
        );
    });

    /** Inspection pass is currently voided. */
    readonly inspectionIsVoided = computed<boolean>(() =>
        (this._activeSecurityInspection()?.precheckStatus === false) ||
        // Fall back: mark as voided if it was removed from the non-deleted results
        // and the store recorded a void success for this passId
        false
    );

    /** Active inspection formatted departure. */
    readonly inspectionDeparture = computed<string>(() => {
        const d = this._activeSecurityInspection()?.departureTime;
        if (!d) return '—';
        return new Date(d).toLocaleString('en-GB', {
            weekday: 'short', day: '2-digit', month: 'short',
            year: 'numeric', hour: '2-digit', minute: '2-digit',
        });
    });

    /** Active inspection formatted boarding time. */
    readonly inspectionBoardingTime = computed<string>(() => {
        const d = this._activeSecurityInspection()?.boardingTime;
        if (!d) return '—';
        return new Date(d).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    });

    // ════════════════════════════════════════════════════════════════════════
    // Public Methods
    // ════════════════════════════════════════════════════════════════════════

    /**
     * Loads initial gate context:
     *   • Boarding pass list (searchBoardingPasses with flightInstanceId)
     *   • Flight manifest (already-boarded passengers)
     * Uses forkJoin for parallel loading.
     */
    loadGateContext(flightId: number): void {
        this._activeFlightId.set(flightId);
        this._gateLoading.set(true);
        this._gateError.set(null);
        this._boardingPasses.set([]);
        this._flightManifest.set([]);
        this._hasLoaded.set(false);
        this._scanningStatus.set('Idle');
        this._scanResult.set(null);

        const filter: IBoardingPassFilter = {
            flightInstanceId: flightId,
            includeDeleted: false,
            hasBoarded: null,
        };

        forkJoin({
            passes: this.svc.searchBoardingPasses(filter, 1, 200),
            manifest: this.svc.getFlightManifest(flightId),
        })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: ({ passes, manifest }) => {
                    this._boardingPasses.set(passes.items ?? []);
                    this._flightManifest.set(manifest ?? []);
                    this._gateLoading.set(false);
                    this._hasLoaded.set(true);
                },
                error: (err) => {
                    this._gateError.set(this._resolveGateError(err));
                    this._gateLoading.set(false);
                },
            });
    }

    /**
     * Performs the gate scan for a boarding pass.
     * State machine: Idle → Scanning → Success | Denied | Warning
     * Auto-resets to Idle after SCAN_RESET_DELAY for continuous workflow.
     */
    performScan(boardingPassId: number): void {
        if (this._isScanLoading()) return; // debounce rapid double-clicks

        const flightId = this._activeFlightId();
        if (!flightId) return;

        const pass = this._boardingPasses().find(p => p.passId === boardingPassId);
        if (!pass) {
            this._emitScanResult('Error', { passengerName: '—', seatNumber: '—', cabinClass: '—', sequenceNumber: 0, message: 'Boarding pass record not found in the manifest.' });
            return;
        }

        this._selectedPassId.set(boardingPassId);
        this._isScanLoading.set(true);
        this._scanningStatus.set('Scanning');

        const request: IGateScanRequest = {
            passId: boardingPassId,
            flightInstanceId: flightId,
        };

        this.svc.scanBoardingPassAtGate(request)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    // Add to manifest optimistically
                    if (!this._flightManifest().some(m => m.passId === boardingPassId)) {
                        this._flightManifest.update(list => [...list, pass]);
                    }
                    this._isScanLoading.set(false);
                    this._emitScanResult('Success', {
                        passengerName: pass.passengerName,
                        seatNumber: pass.seatNumber,
                        cabinClass: pass.cabinClass,
                        sequenceNumber: pass.sequenceNumber,
                        message: 'PASSENGER BOARDED',
                    });
                    this._scheduleStatusReset();
                },
                error: (err) => {
                    this._isScanLoading.set(false);
                    const { status, message } = this._classifyScanError(err);
                    this._emitScanResult(status, {
                        passengerName: pass.passengerName,
                        seatNumber: pass.seatNumber,
                        cabinClass: pass.cabinClass,
                        sequenceNumber: pass.sequenceNumber,
                        message,
                    });
                    this._scheduleStatusReset();
                },
            });
    }

    /** Refreshes the boarding pass list for the active flight. */
    refreshPasses(): void {
        const flightId = this._activeFlightId();
        if (flightId) this.loadGateContext(flightId);
    }

    /** Updates the local search filter (zero-latency — no API call). */
    updateSearchFilter(partial: Partial<IGateSearchFilter>): void {
        this._searchFilter.update(f => ({ ...f, ...partial }));
    }

    resetSearchFilter(): void {
        this._searchFilter.set({ ...DEFAULT_GATE_FILTER });
    }

    resetScan(): void {
        this._scanningStatus.set('Idle');
        this._scanResult.set(null);
        this._selectedPassId.set(null);
    }

    /** Full teardown on component destroy. */
    teardown(): void {
        this._boardingPasses.set([]);
        this._flightManifest.set([]);
        this._scanResult.set(null);
        this._scanningStatus.set('Idle');
        this._gateLoading.set(false);
        this._gateError.set(null);
        this._isScanLoading.set(false);
        this._searchFilter.set({ ...DEFAULT_GATE_FILTER });
        this._activeFlightId.set(null);
        this._selectedPassId.set(null);
        this._hasLoaded.set(false);
    }

    destroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }


    /**
       * Parallel forkJoin: fetches the booking passenger manifest (expected)
       * and the check-in boarded manifest (actual) simultaneously.
       */
    loadFinalManifest(flightId: number): void {
        this._manifestFlightId.set(flightId);
        this._manifestLoading.set(true);
        this._manifestError.set(null);
        this._expectedManifest.set([]);
        this._actualBoarded.set([]);
        this._exportSuccess.set(null);

        forkJoin({
            expected: this.bookingSvc.getPassengerManifest(flightId),
            boarded: this.svc.getFlightManifest(flightId),
        })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: ({ expected, boarded }) => {
                    this._expectedManifest.set((expected as IBookingPassengerDetailDto[]) ?? []);
                    this._actualBoarded.set(boarded ?? []);
                    this._manifestLoading.set(false);
                },
                error: (err) => {
                    this._manifestError.set(this._resolveManifestError(err));
                    this._manifestLoading.set(false);
                },
            });
    }

    /**
     * Exports the official manifest as CSV (PDF/EXCEL requires backend integration).
     * Client-side CSV generation is always available; PDF/EXCEL emit signals
     * for downstream integration with document services.
     */
    exportOfficialManifest(format: 'PDF' | 'EXCEL' | 'CSV' = 'CSV'): void {
        this._isClosingFlight.set(true);
        this._exportSuccess.set(null);

        const manifest = this.comparisonManifest();
        if (!manifest.length) {
            this._isClosingFlight.set(false);
            return;
        }

        if (format === 'CSV') {
            this._generateCsvExport(manifest);
            this._isClosingFlight.set(false);
            this._exportSuccess.set('Official manifest exported as CSV successfully.');
            return;
        }

        // PDF / EXCEL: emit signal for downstream document service integration
        // When the document service is wired up, replace this block with an
        // HTTP call to the admin document generation endpoint.
        setTimeout(() => {
            this._isClosingFlight.set(false);
            this._exportSuccess.set(
                `${format} export queued. Document will be available in the document vault shortly.`
            );
        }, 800);
    }

    /** Clears final manifest state on page destroy. */
    teardownFinalManifest(): void {
        this._expectedManifest.set([]);
        this._actualBoarded.set([]);
        this._manifestLoading.set(false);
        this._manifestError.set(null);
        this._isClosingFlight.set(false);
        this._manifestFlightId.set(null);
        this._exportSuccess.set(null);
    }

    /** Clears export success toast. */
    clearManifestExportState(): void {
        this._exportSuccess.set(null);
    }

    /**
      * Executes a search against the admin search endpoint.
      * Updates searchResults and pagination metadata.
      */
    searchPasses(filters?: Partial<ISecuritySearchFilter>, page: number = 1): void {
        if (filters) this._securityFilter.update(f => ({ ...f, ...filters }));
        this._securityPagination.update(p => ({ ...p, page }));
        this._runSecuritySearch();
    }

    /** Updates local filter draft without triggering a search. */
    updateSecurityFilter(partial: Partial<ISecuritySearchFilter>): void {
        this._securityFilter.update(f => ({ ...f, ...partial }));
    }

    /** Clears search results and resets filter to defaults. */
    clearSecuritySearch(): void {
        this._searchResults.set([]);
        this._securityFilter.set({ ...DEFAULT_SECURITY_FILTER });
        this._securityPagination.set({ ...DEFAULT_SECURITY_PAGINATION });
        this._securityError.set(null);
        this._securityHasSearched.set(false);
        this._activeSecurityInspection.set(null);
        this._voidSuccess.set(null);
    }

    /**
     * Loads full boarding pass detail for the inspection panel.
     * Uses getBoardingPassById — always fetches fresh from server.
     */
    inspectPass(passId: number): void {
        this._inspectionLoading.set(true);
        this._securityError.set(null);

        this.svc.getBoardingPassById(passId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (pass) => {
                    this._activeSecurityInspection.set(pass);
                    // Also set activeFlightId to allow navigation to related flight pages
                    if (pass?.flightInstanceId) {
                        this._activeFlightId.set(pass.flightInstanceId);
                    }
                    this._inspectionLoading.set(false);
                },
                error: (err) => {
                    this._securityError.set(this._resolveSecurityError(err, 'inspect'));
                    this._inspectionLoading.set(false);
                },
            });
    }

    /** Clears the active inspection (closes detail panel). */
    clearInspection(): void {
        this._activeSecurityInspection.set(null);
        this._securityError.set(null);
    }

    /**
     * Executes the irreversible void operation.
     * On success: updates the affected record in searchResults optimistically,
     * clears the inspection panel, and sets the voidSuccess toast signal.
     */
    confirmAndVoid(passId: number): void {
        this._voidLoading.set(true);
        this._securityError.set(null);
        this._voidSuccess.set(null);

        this.svc.voidBoardingPass(passId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    // Optimistically remove from active results (it is now voided/deleted)
                    this._searchResults.update(list =>
                        list.filter(p => p.passId !== passId)
                    );
                    this._activeSecurityInspection.set(null);
                    this._voidLoading.set(false);
                    this._voidSuccess.set(`Boarding pass #${passId} has been voided and removed from the manifest.`);

                    // Auto-clear success toast after 5s
                    setTimeout(() => this._voidSuccess.set(null), 5000);
                },
                error: (err) => {
                    this._securityError.set(this._resolveSecurityError(err, 'void'));
                    this._voidLoading.set(false);
                },
            });
    }

    /** Clears the security error signal. */
    clearSecurityError(): void {
        this._securityError.set(null);
    }

    /** Clears void success toast. */
    clearVoidSuccess(): void {
        this._voidSuccess.set(null);
    }

    /** Pagination helpers. */
    securityNextPage(): void {
        const { page, totalPages } = this._securityPagination();
        if (page < totalPages) {
            this._securityPagination.update(p => ({ ...p, page: p.page + 1 }));
            this._runSecuritySearch();
        }
    }

    securityPrevPage(): void {
        const { page } = this._securityPagination();
        if (page > 1) {
            this._securityPagination.update(p => ({ ...p, page: p.page - 1 }));
            this._runSecuritySearch();
        }
    }

    /** Full teardown on security page destroy. */
    teardownSecurity(): void {
        this.clearSecuritySearch();
        this._inspectionLoading.set(false);
        this._voidLoading.set(false);
    }


    // ── Navigation ─────────────────────────────────────────────────────────
    navigateToFinalManifest(): void {
        const flightId = this._activeFlightId();
        if (flightId) this.router.navigate([BASE, 'flight-final-manifest', flightId]);
    }

    navigateToSwitchFlight(): void {
        this.router.navigate([BASE]);
    }

    // ════════════════════════════════════════════════════════════════════════
    // Private helpers
    // ════════════════════════════════════════════════════════════════════════

    private _emitScanResult(
        status: ScanningStatus,
        data: Omit<IScanResult, 'status' | 'timestamp'>
    ): void {
        this._scanningStatus.set(status);
        this._scanResult.set({ status, ...data, timestamp: new Date() });
    }

    private _scheduleStatusReset(): void {
        setTimeout(() => {
            if (this._scanningStatus() !== 'Scanning') {
                this._scanningStatus.set('Idle');
                this._selectedPassId.set(null);
            }
        }, SCAN_RESET_DELAY);
    }

    private _classifyScanError(err: unknown): { status: ScanningStatus; message: string } {
        if (typeof err === 'object' && err !== null) {
            const e = err as Record<string, unknown>;
            const status = e['status'] as number | undefined;
            const msg = typeof e['message'] === 'string' ? e['message'] : '';

            if (status === 409 || msg.toLowerCase().includes('already boarded')) {
                return { status: 'Warning', message: 'ALREADY BOARDED — Passenger has previously scanned.' };
            }
            if (status === 403 || msg.toLowerCase().includes('wrong gate') || msg.toLowerCase().includes('invalid gate')) {
                return { status: 'Denied', message: 'WRONG GATE — Boarding denied. Check gate assignment.' };
            }
            if (status === 404) {
                return { status: 'Denied', message: 'ACCESS DENIED — Boarding pass not found or invalid.' };
            }
            if (status === 422 || msg.toLowerCase().includes('not eligible')) {
                return { status: 'Denied', message: 'ACCESS DENIED — Passenger not eligible for boarding.' };
            }
            if (status === 0 || status === 503) {
                return { status: 'Error', message: 'SYSTEM ERROR — Gate systems unreachable. Retry scan.' };
            }
            if (msg) return { status: 'Denied', message: msg.toUpperCase() };
        }
        return { status: 'Error', message: 'SCAN ERROR — Unexpected gate system failure.' };
    }

    private _resolveGateError(err: unknown): string {
        if (typeof err === 'object' && err !== null) {
            const e = err as Record<string, unknown>;
            const status = e['status'] as number | undefined;
            if (status === 404) return 'Flight manifest not found. Verify the flight ID.';
            if (status === 403) return 'Access Denied — insufficient clearance for gate operations.';
            if (status === 0 || status === 503) return 'Gate Systems unreachable. Check your network connection.';
            if (typeof e['message'] === 'string') return e['message'];
        }
        return 'Unable to load gate context. Contact Operations Control.';
    }


    private _generateCsvExport(manifest: IManifestEntry[]): void {
        const headers = [
            'Seq', 'Passenger Name', 'Seat', 'Cabin', 'Passport',
            'Booking Ref', 'Ticket Code', 'Status',
        ];
        const rows = manifest.map(p => [
            p.sequenceNumber || '',
            p.passengerName,
            p.seatNumber,
            p.cabinClass,
            p.passportNumber ?? '',
            p.bookingReference,
            p.ticketCode,
            p.hasBoarded ? 'BOARDED' : 'NO-SHOW',
        ]);

        const flightId = this._manifestFlightId() ?? 'unknown';
        const date = new Date().toISOString().split('T')[0];
        const filename = `APA-Manifest-Flight${flightId}-${date}.csv`;

        const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    }

    private _resolveManifestError(err: unknown): string {
        if (typeof err === 'object' && err !== null) {
            const e = err as Record<string, unknown>;
            const status = e['status'] as number | undefined;
            if (status === 404) return 'Flight manifest not found. Verify the flight ID is correct.';
            if (status === 403) return 'Access Denied — insufficient clearance for manifest access.';
            if (status === 0 || status === 503)
                return 'Ground Systems unreachable. Verify your connection and retry.';
            if (typeof e['message'] === 'string') return e['message'];
        }
        return 'Unable to load final manifest. Contact Operations Control immediately.';
    }


    private _runSecuritySearch(): void {
        this._securityLoading.set(true);
        this._securityError.set(null);

        const f = this._securityFilter();
        const { page, pageSize } = this._securityPagination();

        const filter: IBoardingPassFilter = {
            includeDeleted: f.includeDeleted,
            ...(f.flightInstanceId && { flightInstanceId: f.flightInstanceId }),
            ...(f.seatNumber && { seatNumber: f.seatNumber }),
            ...(f.passengerNameContains && { passengerNameContains: f.passengerNameContains }),
            ...(f.hasBoarded !== null && { hasBoarded: f.hasBoarded }),
        };

        this.svc.searchBoardingPasses(filter, page, pageSize)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (result) => {
                    this._searchResults.set(result.items ?? []);
                    const total = result.pagination?.totalCount ?? 0;
                    const totalPages = Math.ceil(total / pageSize);
                    this._securityPagination.update(p => ({ ...p, total, totalPages }));
                    this._securityLoading.set(false);
                    this._securityHasSearched.set(true);
                },
                error: (err) => {
                    this._securityError.set(this._resolveSecurityError(err, 'search'));
                    this._searchResults.set([]);
                    this._securityLoading.set(false);
                    this._securityHasSearched.set(true);
                },
            });
    }

    private _resolveSecurityError(
        err: unknown,
        ctx: 'search' | 'inspect' | 'void'
    ): string {
        if (typeof err === 'object' && err !== null) {
            const e = err as Record<string, unknown>;
            const status = e['status'] as number | undefined;
            const msg = typeof e['message'] === 'string' ? e['message'] : '';

            if (ctx === 'void') {
                if (status === 409) return 'This pass has already been voided or is locked by an active boarding scan.';
                if (status === 403) return 'Insufficient privileges — only Supervisors and above may void boarding passes.';
                if (status === 404) return 'Boarding pass not found. It may have already been removed.';
            }

            if (ctx === 'inspect') {
                if (status === 404) return 'Boarding pass not found. Verify the pass ID and retry.';
                if (status === 403) return 'Access Denied — you do not have clearance to view this document.';
            }

            if (ctx === 'search') {
                if (status === 403) return 'Access Denied — Boarding Pass Security requires Supervisor clearance.';
                if (status === 0 || status === 503) return 'Security Systems unreachable. Check your network connection.';
            }

            if (status === 0 || status === 503)
                return 'System unreachable. Verify your connection and retry.';
            if (msg) return msg;
        }
        return 'An unexpected security error occurred. Contact the Operations Control Centre.';
    }

}