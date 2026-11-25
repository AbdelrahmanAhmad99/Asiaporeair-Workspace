
import { Injectable, computed, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import {
    Subject, switchMap, tap, catchError, of, debounceTime, forkJoin, map,
} from 'rxjs';

import { CrewService } from '@shared-core';
import { AirportsService } from '@shared-core';
import { IPaginatedResult } from '@shared-core';
import {
    ICrewMemberDetailDto, ICertificationDto,
    ICreateCertificationDto, IUpdateCrewBaseRequestDto,
} from '@shared-core';
import { IAirportDto } from '@shared-core';
import {
    ICrewComplianceMember,
    ICrewComplianceFilters,
    ICrewCompliancePagination,
    ComplianceStatus,
} from './crew-compliance.model';
import { IExpiringCertRecord, mapRawToExpiringCertRecord, CertUrgency, } from './crew-watchdog.model';
// ── Route base path ────────────────────────────────────────────────────────
const COMPLIANCE_BASE = 'aoms/workforce-intelligence/crew-compliance';

// ── Internal load trigger payload ──────────────────────────────────────────
interface ILoadPayload {
    filters: ICrewComplianceFilters;
    page: number;
    size: number;
}

// ── Default state constants ────────────────────────────────────────────────
const DEFAULT_FILTERS: ICrewComplianceFilters = {
    base: '',
    rank: '',
    complianceStatus: '',
    search: '',
};

const DEFAULT_PAGINATION: ICrewCompliancePagination = {
    total: 0, page: 1, size: 15,
    totalPages: 0, hasNext: false, hasPrev: false,
};



// ── Pure helper: derive compliance status from raw backend response ─────────
function deriveComplianceStatus(raw: any): ComplianceStatus {
    if (!raw.isActive) return 'NonCompliant';
    // Honor explicit backend field if present
    const status: string = (
        raw.complianceStatus
        ?? raw.overallComplianceStatus
        ?? ''
    ).toLowerCase().replace(/[_\s]/g, '');

    if (status === 'warning' || status === 'expiringsoon') return 'Warning';
    if (status === 'noncompliant' || status === 'expired' || status === 'grounded') return 'NonCompliant';
    return 'Compliant';
}

// ── Pure helper: normalize rank label from raw backend response ─────────────
function normalizeRank(raw: any): string {
    const rank: string = raw.position ?? raw.rank ?? raw.jobTitle ?? raw.role ?? '';
    if (!rank) return '—';
    // Convert PascalCase / camelCase → spaced label
    return rank.replace(/([A-Z])/g, ' $1').replace(/[_-]/g, ' ').trim();
}

// ── Store class ────────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class CrewComplianceStore {

    private readonly crewService = inject(CrewService);
    private readonly airportsService = inject(AirportsService);
    private readonly router = inject(Router);
    private readonly destroyRef = inject(DestroyRef);

    // ── Private Writable Signals ──────────────────────────────────────────
    private readonly _crewMembers = signal<ICrewComplianceMember[]>([]);
    private readonly _pagination = signal<ICrewCompliancePagination>(DEFAULT_PAGINATION);
    private readonly _filters = signal<ICrewComplianceFilters>(DEFAULT_FILTERS);
    private readonly _isLoading = signal<boolean>(false);
    private readonly _operationalError = signal<string | null>(null);

    // ── Profile-level private signals ─────────────────────────────────────
    private readonly _activeCrewMember = signal<ICrewMemberDetailDto | null>(null);
    private readonly _memberCertifications = signal<ICertificationDto[]>([]);
    private readonly _availableAirports = signal<IAirportDto[]>([]);
    private readonly _isProcessing = signal<boolean>(false);
    private readonly _feedbackMessage = signal<{ type: 'success' | 'error'; text: string } | null>(null);

    // ── Watchdog signals ──────────────────────────────────────────────────
    private readonly _expiringCerts = signal<IExpiringCertRecord[]>([]);
    private readonly _watchdogThreshold = signal<number>(30);
    private readonly _watchdogLoading = signal<boolean>(false);
    private readonly _watchdogError = signal<string | null>(null);
    private readonly _fullyCompliant = signal<boolean>(false);

    // ── RxJS Load Subject (debounced pipeline) ─────────────────────────────
    private readonly _loadTrigger$ = new Subject<ILoadPayload>();

    constructor() {
        this._loadTrigger$
            .pipe(
                debounceTime(150),
                tap(() => {
                    this._isLoading.set(true);
                    this._operationalError.set(null);
                }),
                switchMap(({ filters, page, size }) => {
                    // Build backend filter DTO — only include defined fields
                    const dto: any = {
                        ...(filters.base ? { baseAirportIata: filters.base.toUpperCase() } : {}),
                        ...(filters.rank ? { rank: filters.rank } : {}),
                        ...(filters.complianceStatus ? { complianceStatus: filters.complianceStatus } : {}),
                        ...(filters.search ? { search: filters.search } : {}),
                    };

                    return this.crewService.getCrewMembersPaginated(dto, page, size).pipe(
                        catchError(err => {
                            this.handleError(err);
                            // Emit empty page so the pipeline doesn't stall
                            const empty: IPaginatedResult<any> = {
                                items: [], totalCount: 0,
                                pageNumber: page, pageSize: size,
                                totalPages: 0,
                                hasPreviousPage: false, hasNextPage: false,
                            };
                            return of(empty);
                        }),
                    );
                }),
                tap(() => this._isLoading.set(false)),
                takeUntilDestroyed(),
            )
            .subscribe((result: any) => {
                const items: ICrewComplianceMember[] = (result?.items ?? []).map((raw: any) => {
                    const nameParts = (raw.fullName || '').trim().split(/\s+/);
                    const firstName = raw.firstName || nameParts[0] || 'Unknown';
                    const lastName = raw.lastName || (nameParts.length > 1 ? nameParts.slice(1).join(' ') : '');

                    return {
                        employeeId: raw.employeeId,
                        appUserId: raw.appUserId,
                        email: raw.email,
                        firstName,
                        lastName,
                        fullName: raw.fullName || `${firstName} ${lastName}`.trim() || '—',
                        rank: normalizeRank(raw),
                        position: raw.position || raw.rank || '—',
                        baseAirportIata: raw.crewBaseAirportIata || raw.baseAirportIata || '—',
                        isActive: raw.isActive ?? false,
                        overallComplianceStatus: deriveComplianceStatus(raw),
                    };
                });

                this._crewMembers.set(items);
                this._pagination.set({
                    total: result.totalCount,
                    page: result.pageNumber,
                    size: result.pageSize,
                    totalPages: result.totalPages,
                    hasNext: result.hasNextPage,
                    hasPrev: result.hasPreviousPage,
                });
            });
    }

    // ── Public Read-Only Signals ──────────────────────────────────────────
    readonly crewMembers = this._crewMembers.asReadonly();
    readonly paginationMetadata = this._pagination.asReadonly();
    readonly activeFilters = this._filters.asReadonly();
    readonly isLoading = this._isLoading.asReadonly();
    readonly operationalError = this._operationalError.asReadonly();

    // ── Profile-level read-only signals ───────────────────────────────────
    readonly activeCrewMember = this._activeCrewMember.asReadonly();
    readonly memberCertifications = this._memberCertifications.asReadonly();
    readonly availableAirports = this._availableAirports.asReadonly();
    readonly isProcessing = this._isProcessing.asReadonly();
    readonly feedbackMessage = this._feedbackMessage.asReadonly();

    // ── Public read-only: watchdog ────────────────────────────────────────
    readonly expiringCerts = this._expiringCerts.asReadonly();
    readonly watchdogThreshold = this._watchdogThreshold.asReadonly();
    readonly watchdogLoading = this._watchdogLoading.asReadonly();
    readonly watchdogError = this._watchdogError.asReadonly();
    readonly fullyCompliant = this._fullyCompliant.asReadonly();

    /** Computed page numbers with ellipsis tokens (-1, -2) for the paginator. */
    readonly pageNumbers = computed<number[]>(() => {
        const p = this._pagination();
        if (!p.totalPages) return [];
        const curr = p.page;
        const total = p.totalPages;
        if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
        const pages: number[] = [1];
        if (curr > 3) pages.push(-1); // left ellipsis token
        for (let i = Math.max(2, curr - 1); i <= Math.min(total - 1, curr + 1); i++) pages.push(i);
        if (curr < total - 2) pages.push(-2); // right ellipsis token
        pages.push(total);
        return pages;
    });

    /** Computed: true when any filter field is non-empty. */
    readonly hasActiveFilters = computed<boolean>(() => {
        const f = this._filters();
        return !!(f.base || f.rank || f.complianceStatus || f.search);
    });


    /** Urgency summary for the watchdog stats strip. */
    readonly watchdogSummary = computed(() => {
        const records = this._expiringCerts();
        return {
            total: records.length,
            expired: records.filter(r => r.urgency === 'expired').length,
            critical: records.filter(r => r.urgency === 'critical').length,
            warning: records.filter(r => r.urgency === 'warning').length,
        };
    });

    // ── Actions ───────────────────────────────────────────────────────────

    /** Initial / refresh load — triggers the pipeline. */
    loadCrewMembers(page = 1): void {
        this._loadTrigger$.next({
            filters: this._filters(),
            page,
            size: this._pagination().size,
        });
    }

    /** Update one or more filter fields and reload from page 1. */
    updateFilters(newFilters: Partial<ICrewComplianceFilters>): void {
        this._filters.update(f => ({ ...f, ...newFilters }));
        this._loadTrigger$.next({
            filters: this._filters(),
            page: 1,
            size: this._pagination().size,
        });
    }

    /** Clear all filters and reload. */
    resetFilters(): void {
        this._filters.set({ ...DEFAULT_FILTERS });
        this._loadTrigger$.next({
            filters: DEFAULT_FILTERS,
            page: 1,
            size: this._pagination().size,
        });
    }

    // ── Pagination ─────────────────────────────────────────────────────────
    nextPage(): void {
        const p = this._pagination();
        if (!p.hasNext) return;
        this._loadTrigger$.next({ filters: this._filters(), page: p.page + 1, size: p.size });
    }

    prevPage(): void {
        const p = this._pagination();
        if (!p.hasPrev) return;
        this._loadTrigger$.next({ filters: this._filters(), page: p.page - 1, size: p.size });
    }

    goToPage(page: number): void {
        const p = this._pagination();
        if (page < 1 || page > p.totalPages) return;
        this._loadTrigger$.next({ filters: this._filters(), page, size: p.size });
    }

    // ── Error Handling ─────────────────────────────────────────────────────

    /**
     * Parses backend HTTP errors into luxurious, contextual operational alerts.
     * Called by the pipeline catchError operator on every API failure.
     */
    handleError(error: any): void {
        const status: number = error?.status ?? 0;
        let message: string;

        switch (true) {
            case status === 401:
                message = 'Unauthorized Access — Your credentials do not grant access to crew tactical data. Contact your operations administrator.';
                break;
            case status === 403:
                message = 'Access Restricted — Security clearance required to view crew compliance records.';
                break;
            case status === 408:
            case status === 504:
                message = 'Network Timeout — Tactical data link disrupted. Re-establishing connection to the crew compliance server…';
                break;
            case status === 503:
                message = 'Service Unavailable — Crew compliance database is currently being synchronized. Please retry in 60 seconds.';
                break;
            case status >= 500:
                message = `Database Sync Failed — Tactical data is currently being updated. Operations team has been alerted. [ERR-${status}]`;
                break;
            case status === 0:
                message = 'No Signal — Cannot reach the Asiaporeair operations server. Verify your network connection and VPN status.';
                break;
            default:
                message = error?.error?.message
                    ?? error?.message
                    ?? 'An unexpected operational error occurred. Please contact Systems Operations.';
        }

        this._operationalError.set(message);
        this._isLoading.set(false);
    }

    /** Dismiss the current error banner. */
    clearError(): void {
        this._operationalError.set(null);
    }

    // ── Navigation ─────────────────────────────────────────────────────────
    navigateToTechnicalProfile(employeeId: number): void {
        this.router.navigate([COMPLIANCE_BASE, 'technical-profile', employeeId]);
    }

    navigateToWatchdogCenter(): void {
        this.router.navigate([COMPLIANCE_BASE, 'watchdog-center']);
    }

    navigateBackToDirectory(): void {
        this.router.navigate([COMPLIANCE_BASE, 'operational-directory']);
    }

    // ── Technical Profile Actions ──────────────────────────────────────────

    /**
     * Parallel fetch: member details + certifications + active airports.
     * Populates activeCrewMember, memberCertifications, availableAirports.
     */
    loadFullProfile(memberId: string): void {
        const id = +memberId;
        this._isLoading.set(true);
        this._operationalError.set(null);
        this._feedbackMessage.set(null);

        forkJoin({
            member: this.crewService.getCrewMemberDetailsById(id),
            certs: this.crewService.getCertificationsForCrewMember(id),
            airports: this.airportsService.getAllActiveAirports(),
        })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: ({ member, certs, airports }) => {
                    // Robust mapping for detail object
                    const mappedMember: ICrewMemberDetailDto = {
                        ...member,
                        baseAirportIata: (member as any).crewBaseAirportIata || member.baseAirportIata || '—'
                    };

                    // Robust mapping for certifications
                    const mappedCerts: ICertificationDto[] = (certs || []).map((c: any) => ({
                        certId: c.certId,
                        certificationName: c.type || c.certificationName || 'Unspecified Credential',
                        type: c.category || 'Operational', // Use category if exists, or default
                        issueDate: c.issueDate,
                        expiryDate: c.expiryDate,
                        isValid: c.isExpired != null ? !c.isExpired : (c.isValid ?? true),
                    }));

                    this._activeCrewMember.set(mappedMember);
                    this._memberCertifications.set(mappedCerts);
                    this._availableAirports.set(airports);
                    this._isLoading.set(false);
                },
                error: (err) => {
                    this.handleError(err);
                    this._isLoading.set(false);
                },
            });
    }

    /**
     * Update the crew member's home base airport.
     * airportIata — IATA code of the new base (e.g. "SIN").
     */
    updateBase(airportIata: string): void {
        const member = this._activeCrewMember();
        if (!member) return;

        const dto: IUpdateCrewBaseRequestDto = { newBaseAirportIata: airportIata };
        this._isProcessing.set(true);
        this._feedbackMessage.set(null);

        this.crewService.updateCrewBase(member.employeeId, dto)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: () => {
                    this._activeCrewMember.update(m =>
                        m ? { ...m, baseAirportIata: airportIata } : m
                    );
                    this._feedbackMessage.set({
                        type: 'success',
                        text: 'Base Deployment Updated — Strategic reposition confirmed.',
                    });
                    this._isProcessing.set(false);
                },
                error: (err) => {
                    this._feedbackMessage.set({
                        type: 'error',
                        text: err?.error?.message
                            ?? err?.message
                            ?? 'Base update failed. Contact Operations Control.',
                    });
                    this._isProcessing.set(false);
                },
            });
    }


    manageCertification(
        action: 'add' | 'update' | 'delete',
        payload?: { certId?: number; dto?: ICreateCertificationDto },
    ): void {
        const member = this._activeCrewMember();
        if (!member) return;

        this._isProcessing.set(true);
        this._feedbackMessage.set(null);

        let obs$: import('rxjs').Observable<any>;
        if (action === 'add' && payload?.dto) {
            obs$ = this.crewService.addCertification(member.employeeId, payload.dto);
        } else if (action === 'update' && payload?.certId != null && payload?.dto) {
            obs$ = this.crewService.updateCertification(payload.certId, payload.dto);
        } else if (action === 'delete' && payload?.certId != null) {
            obs$ = this.crewService.deleteCertification(payload.certId);
        } else {
            this._isProcessing.set(false);
            return;
        }

        obs$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: () => {
                // Refresh certification list
                this.crewService
                    .getCertificationsForCrewMember(member.employeeId)
                    .pipe(takeUntilDestroyed(this.destroyRef))
                    .subscribe((certs: any[]) => {
                        const mapped = certs.map((c: any) => ({
                            certId: c.certId,
                            certificationName: c.type || c.certificationName || 'Unspecified Credential',
                            type: c.category || 'Operational',
                            issueDate: c.issueDate,
                            expiryDate: c.expiryDate,
                            isValid: c.isExpired != null ? !c.isExpired : (c.isValid ?? true),
                        }));
                        this._memberCertifications.set(mapped);
                    });

                this._feedbackMessage.set({
                    type: 'success',
                    text: 'Credential Log Updated — Pilot Eligibility Reconfirmed.',
                });
                this._isProcessing.set(false);
            },
            error: (err: any) => {
                this._feedbackMessage.set({
                    type: 'error',
                    text: err?.error?.message
                        ?? err?.message
                        ?? 'Certification operation failed. Verify entry data.',
                });
                this._isProcessing.set(false);
            },
        });
    }

    // ── Watchdog actions ──────────────────────────────────────────────────

    loadExpiringCerts(days: number = this._watchdogThreshold()): void {
        this._watchdogLoading.set(true);
        this._watchdogError.set(null);
        this._fullyCompliant.set(false);

        this.crewService
            .getCrewWithExpiringCertifications(days)
            .pipe(
                switchMap((rawItems: any[]) => {
                    if (!rawItems || rawItems.length === 0) {
                        return of([]);
                    }
                    const requests = rawItems.map(raw => {
                        return forkJoin({
                            details: this.crewService.getCrewMemberDetailsById(raw.employeeId).pipe(catchError(() => of(null))),
                            certs: this.crewService.getCertificationsForCrewMember(raw.employeeId).pipe(catchError(() => of([])))
                        }).pipe(
                            map(({ details, certs }) => {
                                const appUserId = (details as any)?.appUserId ?? raw.appUserId ?? '';
                                const baseAirportIata = (details as any)?.crewBaseAirportIata ?? details?.baseAirportIata ?? raw.crewBaseAirportIata ?? raw.baseAirportIata ?? '';

                                const expiringCertsList = (certs || []).filter((c: any) => {
                                    const exp = c.expiryDate || c.expirationDate || c.validUntil;
                                    if (!exp) return false;
                                    const expTime = new Date(exp).getTime();
                                    const now = Date.now();
                                    const daysDiff = Math.ceil((expTime - now) / (1000 * 60 * 60 * 24));
                                    return daysDiff <= days;
                                });

                                if (expiringCertsList.length === 0) {
                                    return [{
                                        ...raw,
                                        appUserId,
                                        baseAirportIata,
                                        crewBaseAirportIata: baseAirportIata
                                    }];
                                }

                                return expiringCertsList.map((c: any) => ({
                                    ...raw,
                                    appUserId,
                                    baseAirportIata,
                                    crewBaseAirportIata: baseAirportIata,
                                    certId: c.certId ?? c.id,
                                    certificationName: c.type ?? c.certificationName ?? 'Unspecified Credential',
                                    certType: c.category ?? c.certificationCategory ?? 'Operational',
                                    issueDate: c.issueDate ?? c.issuedDate,
                                    expiryDate: c.expiryDate ?? c.expirationDate ?? c.validUntil,
                                    isExpired: c.isExpired,
                                    isValid: c.isValid
                                }));
                            })
                        );
                    });
                    return forkJoin(requests).pipe(map(results => results.flat()));
                }),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe({
                next: (enrichedRawItems: any[]) => {
                    const records: IExpiringCertRecord[] = (enrichedRawItems ?? []).map(mapRawToExpiringCertRecord);

                    // Sort: expired first → critical → warning → ok; then soonest first
                    records.sort((a, b) => {
                        const urgencyRank = (u: CertUrgency) =>
                            ({ expired: 0, critical: 1, warning: 2, ok: 3 }[u]);
                        const rankDiff = urgencyRank(a.urgency) - urgencyRank(b.urgency);
                        return rankDiff !== 0 ? rankDiff : a.daysRemaining - b.daysRemaining;
                    });

                    this._expiringCerts.set(records);
                    this._watchdogLoading.set(false);

                    if (records.length === 0) {
                        this._fullyCompliant.set(true);
                    }
                },
                error: (err: any) => {
                    this._watchdogError.set(this._parseWatchdogError(err));
                    this._watchdogLoading.set(false);
                },
            });
    }

    // ── Sets the threshold and immediately refreshes. ──────────────────────
    setThreshold(days: number): void {
        this._watchdogThreshold.set(days);
        this.loadExpiringCerts(days);
    }

    // ── Dismiss the watchdog error banner. ────────────────────────────────
    clearWatchdogError(): void {
        this._watchdogError.set(null);
    }

    // ── Dismiss the full-compliance toast. ───────────────────────────────
    dismissFullyCompliantToast(): void {
        this._fullyCompliant.set(false);
    }

    // ── Private: parse watchdog-specific errors into luxury copy. ─────────
    private _parseWatchdogError(error: any): string {
        const status: number = error?.status ?? 0;
        switch (true) {
            case status === 401:
                return 'Authorization Failure — Watchdog access requires elevated security clearance.';
            case status === 403:
                return 'Access Restricted — Only Operations Supervisors and above may access compliance radar data.';
            case status === 503:
                return 'Compliance Database Offline — The certification registry is temporarily unavailable for synchronization.';
            case status >= 500:
                return `Database Sync Interrupted — Safety certification data could not be retrieved. Systems team has been notified. [ERR-${status}]`;
            case status === 0:
                return 'No Signal — Unable to reach the Asiaporeair compliance server. Verify network connectivity and VPN status.';
            default:
                return (
                    error?.error?.message ??
                    error?.message ??
                    'Watchdog scan failed. Contact Operations Safety Control immediately.'
                );
        }
    }

    /** Dismiss the feedback toast. */
    clearFeedback(): void {
        this._feedbackMessage.set(null);
    }
}
