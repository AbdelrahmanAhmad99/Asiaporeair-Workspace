

import { Injectable, computed, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import {
    Subject, switchMap, tap, catchError, of, debounceTime,
    EMPTY, forkJoin, Observable, map,
} from 'rxjs';

import { FlightOperationsService } from '@shared-core';
import { CrewService } from '@shared-core';
import { IPaginatedResult } from '@shared-core';

import {
    IFlightInstanceDto,
    IFlightInstanceFilterDto,
} from '@shared-core';

import {
    ICrewMemberSummaryDto, ICrewAvailabilityRequestDto,
    ICrewFilterDto, ICrewScheduleRequestDto, ICrewAssignmentDto
} from '@shared-core';

// ── Types ────────────────────────────────────────────────────────────────

export type PlannerView = 'search' | 'planning';
export type CrewSelectorMode = 'closed' | 'pilot' | 'attendant';

export interface ITrcPagination {
    total: number;
    page: number;
    size: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export interface IRosterEntry {
    employeeId: number;
    fullName: string;
    position: string;
    baseAirport: string;
    isActive: boolean;
    appUserId: string;
    email: string;
    role: 'pilot' | 'attendant';
}


export type CrewRank = 'captain' | 'first-officer' | 'lead-purser' | 'purser' | 'senior-attendant' | 'attendant' | '';

export interface IAvailabilitySearchCriteria {
    /** Mode: flight-based (uses findAvailableCrew) or free-form (uses getCrewMembersPaginated) */
    mode: 'flight' | 'freeform';
    flightInstanceId?: number;
    baseAirportIata?: string;
    rank?: CrewRank;
    date?: string;           // ISO date for display/filtering only
    showInactiveOnly?: boolean;
    flightDepartureTime?: string; // ISO Date String
    flightArrivalTime?: string;   // ISO Date String
    requiredPosition?: string;
    requiredBaseAirportIata?: string;
    requiredAircraftTypeId?: number;
}

export interface ICrewAvailabilityResult {
    employeeId: number;
    fullName: string;
    position: string;
    baseAirportIata: string;
    email: string;
    isActive: boolean;
    appUserId: string;
    // Derived / enriched in store
    rank: CrewRank;
    availabilityStatus: 'ready' | 'limited' | 'unavailable';
    /** Synthetic duty hours — derived from position heuristics */
    remainingDutyHours: number;
    maxDutyHours: number;
    dutyHoursPercent: number;         // 0–100
}

export type AehLoadState = 'idle' | 'loading' | 'loaded' | 'error';

export type DutyEventType =
    | 'flight'
    | 'standby'
    | 'training'
    | 'rest'
    | 'off'
    | 'ground'
    | 'medical'
    | 'simulator';

export interface IScheduleEventDto {
    /** Raw fields from API — mapped from the any[] response */
    eventId: number;
    employeeId: number;
    type: DutyEventType;
    title: string;         // e.g. "SQ211 SIN→NRT"
    startTime: string;         // ISO string
    endTime: string;         // ISO string
    status: string;         // "Scheduled" | "Completed" | "Cancelled" | "Standby"
    flightNo?: string;
    originIata?: string;
    destinationIata?: string;
    aircraftTailNo?: string;
    notes?: string;
}

export interface IScheduleDutyEvent {
    raw: IScheduleEventDto;
    startDate: Date;
    endDate: Date;
    durationMinutes: number;
    dayIndex: number;          // 0-6 within the week for weekly view
    weekRow: number;
    isMultiDay: boolean;
    spanDays: number;
}

export type CalendarView = 'monthly' | 'weekly';

export interface IScheduleDateRange {
    start: Date;
    end: Date;
}


interface IFlightSearchPayload { filter: IFlightInstanceFilterDto; page: number; size: number; }
interface ICrewSearchPayload { filter: ICrewFilterDto; page: number; size: number; }

const DEFAULT_PAGINATION: ITrcPagination = {
    total: 0, page: 1, size: 50,
    totalPages: 0, hasNext: false, hasPrev: false,
};

/** Map SummaryDto's position field to display role */
function inferRole(pos: string): 'pilot' | 'attendant' {
    const p = (pos ?? '').toLowerCase();
    return p.includes('pilot') || p.includes('captain') || p.includes('officer') || p.includes('co-pilot')
        ? 'pilot' : 'attendant';
}

@Injectable({ providedIn: 'root' })
export class TacticalTrcStore {
    private readonly flightOpsService = inject(FlightOperationsService);
    private readonly crewService = inject(CrewService);
    private readonly router = inject(Router);
    private readonly destroyRef = inject(DestroyRef);

    // ── Private Writable Signals ─────────────────────────────────────
    private readonly _plannerView = signal<PlannerView>('search');
    private readonly _flightInstances = signal<IFlightInstanceDto[]>([]);
    private readonly _flightPagination = signal<ITrcPagination>(DEFAULT_PAGINATION);
    private readonly _flightFilters = signal<IFlightInstanceFilterDto>({});
    private readonly _isLoadingFlights = signal<boolean>(false);
    private readonly _flightLoadError = signal<string | null>(null);
    private readonly _selectedFlight = signal<IFlightInstanceDto | null>(null);
    private readonly _selectedFlightId = signal<number | null>(null);
    private readonly _currentRoster = signal<IRosterEntry[]>([]);
    private readonly _isLoadingRoster = signal<boolean>(false);
    private readonly _rosterError = signal<string | null>(null);
    private readonly _rosterErrors = signal<string[]>([]);
    private readonly _isProcessing = signal<boolean>(false);
    private readonly _actionError = signal<string | null>(null);
    private readonly _actionSuccess = signal<string | null>(null);
    private readonly _crewSelectorMode = signal<CrewSelectorMode>('closed');
    private readonly _availableCrewList = signal<ICrewMemberSummaryDto[]>([]);
    private readonly _crewPagination = signal<ITrcPagination>(DEFAULT_PAGINATION);
    private readonly _isLoadingCrew = signal<boolean>(false);
    private readonly _crewFilters = signal<ICrewFilterDto>({});
    private readonly _pendingRemoveId = signal<number | null>(null);
    private readonly _showRemoveConfirm = signal<boolean>(false);


    // ── Availability Explorer State ─────────────────────────────────────
    private readonly _availableCrew = signal<ICrewAvailabilityResult[]>([]);
    private readonly _searchCriteria = signal<IAvailabilitySearchCriteria>({ mode: 'freeform' });
    private readonly _aehLoadState = signal<AehLoadState>('idle');
    private readonly _operationalError = signal<string | null>(null);
    private readonly _selectedForRoster = signal<Set<number>>(new Set<number>());
    private readonly _certExpiryDays = signal<number>(30);
    private readonly _expiringCertCrew = signal<ICrewAvailabilityResult[]>([]);
    private readonly _isLoadingExpiring = signal<boolean>(false);

    // ── Personal Duty Visualizer State ──────────────────────────────────
    private readonly _activeSchedule = signal<IScheduleDutyEvent[]>([]);
    private readonly _focusedMemberId = signal<number | null>(null);
    private readonly _scheduleDateRange = signal<IScheduleDateRange>({
        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
    });
    private readonly _scheduleLoading = signal<boolean>(false);
    private readonly _scheduleError = signal<string | null>(null);
    private readonly _calendarView = signal<CalendarView>('monthly');
    private readonly _scheduleSuccess = signal<string | null>(null);

    // ── RxJS pipelines ───────────────────────────────────────────────
    private readonly _flightSearch$ = new Subject<IFlightSearchPayload>();
    private readonly _crewSearch$ = new Subject<ICrewSearchPayload>();

    constructor() {
        // ── Flight search pipeline (150ms debounce) ──────────────────
        this._flightSearch$
            .pipe(
                debounceTime(150),
                tap(() => { this._isLoadingFlights.set(true); this._flightLoadError.set(null); }),
                switchMap(({ filter, page, size }) =>
                    this.flightOpsService
                        .searchFlightInstances(filter, page, size)
                        .pipe(
                            catchError(err => {
                                this._flightLoadError.set(
                                    err?.message ?? 'Flight data synchronization encountered a technical barrier.'
                                );
                                const empty: IPaginatedResult<IFlightInstanceDto> = {
                                    items: [], totalCount: 0, pageNumber: page, pageSize: size,
                                    totalPages: 0, hasPreviousPage: false, hasNextPage: false,
                                };
                                return of(empty);
                            })
                        )
                ),
                tap(() => this._isLoadingFlights.set(false)),
                takeUntilDestroyed()
            )
            .subscribe((result: IPaginatedResult<IFlightInstanceDto>) => {
                const mappedItems = (result.items ?? []).map(f => this.mapBackendFlightToDto(f));
                this._flightInstances.set(mappedItems);
                this._flightPagination.set({
                    total: result.totalCount,
                    page: result.pageNumber,
                    size: result.pageSize,
                    totalPages: result.totalPages,
                    hasNext: result.hasNextPage,
                    hasPrev: result.hasPreviousPage,
                });
            });

        // ── Crew search pipeline (150ms debounce) ────────────────────
        this._crewSearch$
            .pipe(
                debounceTime(150),
                tap(() => this._isLoadingCrew.set(true)),
                switchMap(({ filter, page, size }) =>
                    this.crewService
                        .getCrewMembersPaginated(filter, page, size)
                        .pipe(
                            map(res => {
                                // If we are looking for cabin crew, exclude anyone whose role is inferred as pilot
                                if (this._crewSelectorMode() === 'attendant') {
                                    res.items = (res.items ?? []).filter(c => inferRole(c.position) !== 'pilot');
                                }
                                return res;
                            }),
                            catchError(() => of({
                                items: [], totalCount: 0, pageNumber: page, pageSize: size,
                                totalPages: 0, hasPreviousPage: false, hasNextPage: false,
                            } as IPaginatedResult<ICrewMemberSummaryDto>))
                        )
                ),
                tap(() => this._isLoadingCrew.set(false)),
                takeUntilDestroyed()
            )
            .subscribe((result: IPaginatedResult<ICrewMemberSummaryDto>) => {
                this._availableCrewList.set(result.items ?? []);
                this._crewPagination.set({
                    total: result.totalCount,
                    page: result.pageNumber,
                    size: result.pageSize,
                    totalPages: result.totalPages,
                    hasNext: result.hasNextPage,
                    hasPrev: result.hasPreviousPage,
                });
            });
    }

    // ── Public Signals ────────────────────────────────────────────────
    readonly plannerView = this._plannerView.asReadonly();
    readonly flightInstances = this._flightInstances.asReadonly();
    readonly flightPagination = this._flightPagination.asReadonly();
    readonly flightFilters = this._flightFilters.asReadonly();
    readonly isLoadingFlights = this._isLoadingFlights.asReadonly();
    readonly flightLoadError = this._flightLoadError.asReadonly();
    readonly selectedFlight = this._selectedFlight.asReadonly();
    readonly selectedFlightId = this._selectedFlightId.asReadonly();
    readonly currentRoster = this._currentRoster.asReadonly();
    readonly isLoadingRoster = this._isLoadingRoster.asReadonly();
    readonly rosterError = this._rosterError.asReadonly();
    readonly rosterErrors = this._rosterErrors.asReadonly();
    readonly isProcessing = this._isProcessing.asReadonly();
    readonly actionError = this._actionError.asReadonly();
    readonly actionSuccess = this._actionSuccess.asReadonly();
    readonly crewSelectorMode = this._crewSelectorMode.asReadonly();
    readonly availableCrewList = this._availableCrewList.asReadonly();
    readonly crewPagination = this._crewPagination.asReadonly();
    readonly isLoadingCrew = this._isLoadingCrew.asReadonly();
    readonly pendingRemoveId = this._pendingRemoveId.asReadonly();
    readonly showRemoveConfirm = this._showRemoveConfirm.asReadonly();

    // Computed
    readonly pilotRoster = computed<IRosterEntry[]>(() =>
        this._currentRoster().filter(c => c.role === 'pilot')
    );

    readonly attendantRoster = computed<IRosterEntry[]>(() =>
        this._currentRoster().filter(c => c.role === 'attendant')
    );

    readonly rosterCount = computed(() => this._currentRoster().length);

    readonly hasConflicts = computed(() => this._rosterErrors().length > 0);

    readonly pendingRemoveEntry = computed<IRosterEntry | null>(() => {
        const id = this._pendingRemoveId();
        return id ? (this._currentRoster().find(r => r.employeeId === id) ?? null) : null;
    });

    // ──  these public read-only signals ─────────────────────────────────

    readonly availableCrew = this._availableCrew.asReadonly();
    readonly searchCriteria = this._searchCriteria.asReadonly();
    readonly aehLoadState = this._aehLoadState.asReadonly();
    readonly operationalError = this._operationalError.asReadonly();
    readonly selectedForRoster = this._selectedForRoster.asReadonly();
    readonly expiringCertCrew = this._expiringCertCrew.asReadonly();
    readonly isLoadingExpiring = this._isLoadingExpiring.asReadonly();
    readonly certExpiryDays = this._certExpiryDays.asReadonly();

    // Computed
    readonly selectedForRosterCount = computed(() => this._selectedForRoster().size);
    readonly selectedForRosterArr = computed(() => [...this._selectedForRoster()]);
    readonly isLoadingAeh = computed(() => this._aehLoadState() === 'loading');
    readonly hasAehResults = computed(() => this._availableCrew().length > 0);

    readonly filteredByRank = computed<ICrewAvailabilityResult[]>(() => {
        const rank = this._searchCriteria().rank;
        if (!rank) return this._availableCrew();
        return this._availableCrew().filter(c => c.rank === rank);
    });

    readonly activeSchedule = this._activeSchedule.asReadonly();
    readonly focusedMemberId = this._focusedMemberId.asReadonly();
    readonly scheduleDateRange = this._scheduleDateRange.asReadonly();
    readonly scheduleLoading = this._scheduleLoading.asReadonly();
    readonly scheduleError = this._scheduleError.asReadonly();
    readonly calendarView = this._calendarView.asReadonly();
    readonly scheduleSuccess = this._scheduleSuccess.asReadonly();

    // Computed: group events by ISO date string for O(1) calendar cell lookup
    readonly scheduleByDate = computed<Map<string, IScheduleDutyEvent[]>>(() => {
        const map = new Map<string, IScheduleDutyEvent[]>();
        for (const ev of this._activeSchedule()) {
            const key = ev.startDate.toISOString().slice(0, 10);
            const arr = map.get(key) ?? [];
            arr.push(ev);
            map.set(key, arr);
        }
        return map;
    });

    // Computed: flight-only events for summary KPIs
    readonly flightEvents = computed(() =>
        this._activeSchedule().filter(e => e.raw.type === 'flight')
    );

    // Computed: total duty hours in range
    readonly totalDutyHours = computed(() => {
        const mins = this._activeSchedule()
            .filter(e => e.raw.type !== 'rest' && e.raw.type !== 'off')
            .reduce((sum, e) => sum + e.durationMinutes, 0);
        return Math.round(mins / 60 * 10) / 10;
    });

    // ── ACTIONS ────────────────────────────────────────────────────────

    /** Trigger or reset the flight search */
    searchFlights(filter: Partial<IFlightInstanceFilterDto> = {}, page = 1): void {
        this._flightFilters.update(f => ({ ...f, ...filter }));
        this._flightSearch$.next({ filter: this._flightFilters(), page, size: this._flightPagination().size });
    }

    /** Initial load */
    loadFlights(): void {
        this._flightSearch$.next({ filter: this._flightFilters(), page: 1, size: this._flightPagination().size });
    }

    resetFlightFilters(): void {
        this._flightFilters.set({});
        this._flightSearch$.next({ filter: {}, page: 1, size: this._flightPagination().size });
    }

    nextFlightPage(): void {
        if (!this._flightPagination().hasNext) return;
        this._flightSearch$.next({ filter: this._flightFilters(), page: this._flightPagination().page + 1, size: this._flightPagination().size });
    }

    prevFlightPage(): void {
        if (!this._flightPagination().hasPrev) return;
        this._flightSearch$.next({ filter: this._flightFilters(), page: this._flightPagination().page - 1, size: this._flightPagination().size });
    }

    /** Select a flight and enter planning view */
    selectFlight(flight: IFlightInstanceDto): void {
        const mapped = this.mapBackendFlightToDto(flight);
        this._selectedFlight.set(mapped);
        this._selectedFlightId.set(mapped.instanceId);
        this._plannerView.set('planning');
        this._rosterErrors.set([]);
        this._actionError.set(null);
        this.loadRoster(mapped.instanceId);
    }

    backToSearch(): void {
        this._plannerView.set('search');
        this._selectedFlight.set(null);
        this._selectedFlightId.set(null);
        this._currentRoster.set([]);
        this._rosterErrors.set([]);
        this._actionError.set(null);
    }

    /** Fetch the crew roster for a flight */
    loadRoster(flightId: number): void {
        this._isLoadingRoster.set(true);
        this._rosterError.set(null);
        // Do not clear current roster immediately to avoid flickers if possible, 
        // but user expects a fresh load so it's okay for now.

        this.crewService.getFlightRoster(flightId)
            .pipe(
                catchError(err => {
                    this._rosterError.set(
                        err?.message ?? 'Roster synchronization encountered a technical barrier.'
                    );
                    this._isLoadingRoster.set(false);
                    return EMPTY;
                }),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe((rawResponse: any) => {
                let rosterData: ICrewMemberSummaryDto[] = [];

                // Handle cases where backend returns the flight object with an assignedCrew array
                if (Array.isArray(rawResponse)) {
                    rosterData = rawResponse;
                } else if (rawResponse && Array.isArray(rawResponse.assignedCrew)) {
                    rosterData = rawResponse.assignedCrew;

                    // If we don't have a selected flight (e.g. deep link), populate it from this response
                    if (!this._selectedFlight()) {
                        this._selectedFlight.set(this.mapBackendFlightToDto(rawResponse));
                        this._selectedFlightId.set(flightId);
                    }
                }

                const entries: IRosterEntry[] = (rosterData ?? []).map((m: any) => ({
                    employeeId: m.crewMemberEmployeeId ?? m.employeeId,
                    fullName: m.crewMemberName ?? (m.fullName || `${m.firstName || ''} ${m.lastName || ''}`.trim()),
                    position: m.position,
                    baseAirport: m.crewBase ?? (m.crewBaseAirportIata ?? m.baseAirportIata),
                    isActive: m.isActive ?? true,
                    appUserId: m.appUserId,
                    email: m.email,
                    role: (m.assignedRole ?? inferRole(m.position)).toLowerCase() as 'pilot' | 'attendant',
                }));

                this._currentRoster.set(entries);
                this._isLoadingRoster.set(false);
            });
    }

    /**
     * Maps backend property names to the frontend IFlightInstanceDto.
     * Bridging the gap between 'flightInstanceId' -> 'instanceId', etc.
     */
    private mapBackendFlightToDto(raw: any): IFlightInstanceDto {
        if (!raw) return {} as IFlightInstanceDto;
        return {
            ...raw, // Start with all fields
            instanceId: raw.flightInstanceId ?? raw.instanceId,
            flightNo: raw.flightNumber ?? raw.flightNo,
            originIataCode: raw.originAirport ?? raw.originIataCode ?? raw.originAirportIata,
            originAirportIata: raw.originAirport ?? raw.originAirportIata ?? raw.originIataCode,
            destinationIataCode: raw.destinationAirport ?? raw.destinationIataCode ?? raw.destinationAirportIata,
            destinationAirportIata: raw.destinationAirport ?? raw.destinationAirportIata ?? raw.destinationIataCode,
            assignedAircraftModel: raw.aircraftType ?? raw.assignedAircraftModel ?? raw.scheduledAircraftModel,
            status: raw.status ?? 'Scheduled',
        } as IFlightInstanceDto;
    }

    /** Assign one or more crew members to the active flight */
    assignMember(crewMemberIds: number[]): Promise<boolean> {
        const flightId = this._selectedFlightId();
        if (!flightId) return Promise.resolve(false);

        this._isProcessing.set(true);
        this._actionError.set(null);
        this._actionSuccess.set(null);

        return new Promise(resolve => {
            const role = this._crewSelectorMode() === 'pilot' ? 'Pilot' : 'Attendant';
            const assignmentDtos: ICrewAssignmentDto[] = crewMemberIds.map(id => ({
                crewMemberEmployeeId: id,
                role: role
            }));

            this.crewService.assignCrewToFlight({
                flightInstanceId: flightId,
                assignments: assignmentDtos
            })
                .pipe(
                    catchError(err => {
                        const code = err?.status;
                        const errorBody = err?.error;
                        let detail = errorBody?.message ?? err?.message ?? '';

                        // Extract detailed validation errors if present (e.g. from ASP.NET Core ValidationErrors)
                        if (errorBody?.errors && typeof errorBody.errors === 'object') {
                            const messages = Object.values(errorBody.errors).flat();
                            if (messages.length > 0) {
                                detail = messages.join(' ');
                            }
                        }

                        let msg: string;

                        if (code === 409) {
                            msg = `Crew Member Rest Period Violation — ${detail}`;
                        } else if (code === 400) {
                            msg = `Assignment Constraint — ${detail}`;
                        } else if (code === 403) {
                            msg = `Insufficient Authorization — your clearance level cannot modify this flight roster.`;
                        } else {
                            msg = detail || 'Crew assignment encountered a technical barrier.';
                        }

                        this._actionError.set(msg);
                        this._rosterErrors.update(e => [...e, msg]);
                        this._isProcessing.set(false);
                        resolve(false);
                        return EMPTY;
                    }),
                    takeUntilDestroyed(this.destroyRef)
                )
                .subscribe(() => {
                    this._isProcessing.set(false);
                    this._actionSuccess.set('Crew assignment confirmed. Roster updated.');
                    this.loadRoster(flightId);   // refresh roster
                    this._crewSelectorMode.set('closed');
                    setTimeout(() => this._actionSuccess.set(null), 3500);
                    resolve(true);
                });
        });
    }

    /** Initiate removal confirmation */
    requestRemoveMember(employeeId: number): void {
        this._pendingRemoveId.set(employeeId);
        this._showRemoveConfirm.set(true);
    }

    cancelRemove(): void {
        this._pendingRemoveId.set(null);
        this._showRemoveConfirm.set(false);
    }

    /** Execute removal after confirmation */
    confirmRemoveMember(): Promise<boolean> {
        const employeeId = this._pendingRemoveId();
        const flightId = this._selectedFlightId();
        if (!employeeId || !flightId) return Promise.resolve(false);

        this._isProcessing.set(true);
        this._actionError.set(null);
        this._showRemoveConfirm.set(false);

        return new Promise(resolve => {
            this.crewService.removeCrewFromFlight(flightId, employeeId)
                .pipe(
                    catchError(err => {
                        const code = err?.status;
                        const errorBody = err?.error;
                        let detail = errorBody?.message ?? err?.message ?? '';

                        // Extract detailed validation errors if present
                        if (errorBody?.errors && typeof errorBody.errors === 'object') {
                            const messages = Object.values(errorBody.errors).flat();
                            if (messages.length > 0) detail = messages.join(' ');
                        }

                        let msg: string;

                        if (code === 409) {
                            msg = `Removal Blocked — ${detail}`;
                        } else if (code === 403) {
                            msg = `Insufficient Authorization — roster removal requires supervisor clearance.`;
                        } else {
                            msg = detail || 'Crew removal encountered a technical barrier.';
                        }

                        this._actionError.set(msg);
                        this._rosterErrors.update(e => [...e, msg]);
                        this._isProcessing.set(false);
                        this._pendingRemoveId.set(null);
                        resolve(false);
                        return EMPTY;
                    }),
                    takeUntilDestroyed(this.destroyRef)
                )
                .subscribe(() => {
                    // Optimistic local removal
                    this._currentRoster.update(r => r.filter(e => e.employeeId !== employeeId));
                    this._actionSuccess.set('Crew member removed from the manifest.');
                    this._isProcessing.set(false);
                    this._pendingRemoveId.set(null);
                    setTimeout(() => this._actionSuccess.set(null), 3000);
                    resolve(true);
                });
        });
    }

    /** Open the crew selector modal */
    openCrewSelector(mode: 'pilot' | 'attendant'): void {
        this._crewSelectorMode.set(mode);
        this._actionError.set(null);
        this._availableCrewList.set([]);
        // Build a filter based on role and base airport of the flight
        const flight = this._selectedFlight();
        const baseFilter: ICrewFilterDto = {
            isActive: true,
            position: mode === 'pilot' ? 'Pilot' : undefined
        };
        this.fetchEligibleCrew(baseFilter);
    }

    closeCrewSelector(): void {
        this._crewSelectorMode.set('closed');
        this._availableCrewList.set([]);
    }

    /** Fetch eligible crew for assignment */
    fetchEligibleCrew(filter: ICrewFilterDto = {}, page = 1): void {
        this._crewFilters.set(filter);
        this._crewSearch$.next({ filter, page, size: this._crewPagination().size });
    }

    clearActionState(): void {
        this._actionError.set(null);
        this._actionSuccess.set(null);
    }

    clearRosterErrors(): void {
        this._rosterErrors.set([]);
    }

    dismissRosterError(index: number): void {
        this._rosterErrors.update(e => e.filter((_, i) => i !== index));
    }



    // ===========================================================================
    // AVAILABILITY EXPLORER HUB ACTIONS
    // ===========================================================================

    /**
     * Primary search dispatcher. Routes to the correct service call based on
     * the selected mode:
     *   'flight'   → findAvailableCrew({ flightInstanceId })
     *   'freeform' → getCrewMembersPaginated({ baseAirportIata, isActive: true })
     */
    executeSearch(criteria: IAvailabilitySearchCriteria): void {
        this._searchCriteria.set(criteria);
        this._aehLoadState.set('loading');
        this._operationalError.set(null);
        this._availableCrew.set([]);
        this._selectedForRoster.set(new Set());

        let source$: Observable<ICrewMemberSummaryDto[]>;

        if (criteria.mode === 'flight') {
            if (criteria.flightInstanceId) {
                source$ = this.flightOpsService.getInstanceById(criteria.flightInstanceId).pipe(
                    switchMap(flight => {
                        const req: ICrewAvailabilityRequestDto = {
                            flightDepartureTime: criteria.flightDepartureTime ? new Date(criteria.flightDepartureTime).toISOString() : new Date(flight.scheduledDeparture).toISOString(),
                            flightArrivalTime: criteria.flightArrivalTime ? new Date(criteria.flightArrivalTime).toISOString() : new Date(flight.scheduledArrival).toISOString(),
                            requiredBaseAirportIata: criteria.requiredBaseAirportIata || flight.originAirportIata,
                            requiredPosition: criteria.requiredPosition || (criteria.rank ? (this.isPilotRank(criteria.rank) ? 'Pilot' : 'Attendant') : undefined),
                            requiredAircraftTypeId: criteria.requiredAircraftTypeId
                        };
                        return this.crewService.findAvailableCrew(req);
                    }),
                    map(raw => (raw ?? []) as ICrewMemberSummaryDto[])
                );
            } else {
                const req: ICrewAvailabilityRequestDto = {
                    flightDepartureTime: new Date(criteria.flightDepartureTime!).toISOString(),
                    flightArrivalTime: new Date(criteria.flightArrivalTime!).toISOString(),
                    requiredBaseAirportIata: criteria.requiredBaseAirportIata,
                    requiredPosition: criteria.requiredPosition || (criteria.rank ? (this.isPilotRank(criteria.rank) ? 'Pilot' : 'Attendant') : undefined),
                    requiredAircraftTypeId: criteria.requiredAircraftTypeId
                };
                source$ = this.crewService.findAvailableCrew(req).pipe(
                    map(raw => (raw ?? []) as ICrewMemberSummaryDto[])
                );
            }
        } else {
            const filter: ICrewFilterDto = {
                isActive: !criteria.showInactiveOnly,
                baseAirportIata: criteria.baseAirportIata || undefined,
            };
            source$ = this.crewService
                .getCrewMembersPaginated(filter, 1, 50)
                .pipe(map(r => (r?.items ?? []) as ICrewMemberSummaryDto[]));
        }

        source$.pipe(
            catchError(err => {
                this._operationalError.set(this.handleBackendError(err));
                this._aehLoadState.set('error');
                return EMPTY;
            }),
            takeUntilDestroyed(this.destroyRef)
        ).subscribe(raw => {
            const mapped = raw
                .filter(m => {
                    // Client-side rank filter (position string heuristic)
                    if (!criteria.rank) return true;
                    return this.matchesRank(m.position, criteria.rank);
                })
                .map(m => this.enrichCrewMember(m));
            this._availableCrew.set(mapped);
            this._aehLoadState.set('loaded');
        });
    }

    /** Reset the explorer back to idle state */
    resetSearch(): void {
        this._availableCrew.set([]);
        this._searchCriteria.set({ mode: 'freeform' });
        this._aehLoadState.set('idle');
        this._operationalError.set(null);
        this._selectedForRoster.set(new Set());
    }

    /** Toggle a crew member in the selected-for-roster set */
    toggleRosterSelection(employeeId: number): void {
        this._selectedForRoster.update(s => {
            const n = new Set(s);
            n.has(employeeId) ? n.delete(employeeId) : n.add(employeeId);
            return n;
        });
    }

    clearRosterSelections(): void {
        this._selectedForRoster.set(new Set());
    }

    /** Retry: re-run the last search with the same criteria */
    retrySearch(): void {
        const c = this._searchCriteria();
        if (c.mode !== 'idle' as unknown as string) this.executeSearch(c);
    }

    /** Load crew with expiring certifications for the alert panel */
    loadExpiringCertifications(days = 30): void {
        this._certExpiryDays.set(days);
        this._isLoadingExpiring.set(true);

        this.crewService.getCrewWithExpiringCertifications(days).pipe(
            catchError(() => of([])),
            takeUntilDestroyed(this.destroyRef)
        ).subscribe(raw => {
            const mapped = ((raw ?? []) as ICrewMemberSummaryDto[]).map(m => this.enrichCrewMember(m));
            this._expiringCertCrew.set(mapped);
            this._isLoadingExpiring.set(false);
        });
    }

    /**
     * Parses API error codes into aviation-register concierge messages.
     * Called internally; also exposed for template error rendering.
     */
    handleBackendError(error: { status?: number; message?: string; error?: { message?: string } }): string {
        const code = error?.status;
        const detail = error?.error?.message ?? error?.message ?? '';

        if (!code || code === 0 || code === 503) {
            return `System Timeout — Crew Availability Data is currently syncing. The operational database may be performing a scheduled refresh. Please retry in 30 seconds.`;
        }
        if (code === 400) {
            return `Search Constraint Violation — ${detail || 'one or more search parameters are outside valid operational ranges.'}`;
        }
        if (code === 403 || code === 401) {
            return `Clearance Barrier — your authorization level does not include access to the crew availability matrix for this flight or base.`;
        }
        if (code === 404) {
            return `Operational Record Not Found — the specified flight instance or base airport could not be located in the active schedule.`;
        }
        if (code === 409) {
            return `Scheduling Conflict — the availability system detected an inconsistency in the crew duty roster data. Please contact the operations supervisor.`;
        }
        return `Technical Barrier Detected — ${detail || 'crew availability synchronization encountered an unexpected error. The operations team has been notified.'}`;
    }


    // ===========================================================================
    // PERSONAL DUTY VISUALIZER ACTIONS
    // ===========================================================================

    /**
     * Fetches the crew member schedule for a given range.
     * Maps the raw any[] to typed IScheduleDutyEvent[].
     */
    loadSchedule(memberId: number, range: IScheduleDateRange): void {
        this._focusedMemberId.set(memberId);
        this._scheduleDateRange.set(range);
        this._scheduleLoading.set(true);
        this._scheduleError.set(null);
        this._activeSchedule.set([]);

        const request: ICrewScheduleRequestDto = {
            crewMemberEmployeeId: memberId,
            startDate: range.start.toISOString().slice(0, 10),
            endDate: range.end.toISOString().slice(0, 10),
        };

        this.crewService.getCrewMemberSchedule(request)
            .pipe(
                catchError(err => {
                    const code = err?.status;
                    const detail = err?.error?.message ?? err?.message ?? '';
                    let msg: string;

                    if (!code || code === 0 || code === 503) {
                        msg = `Schedule Data Unavailable for Selected Period — the duty roster system is currently synchronising. Please wait and re-sync.`;
                    } else if (code === 404) {
                        msg = `No operational duty window found for this crew member in the selected period. The schedule may not have been published yet.`;
                    } else if (code === 403 || code === 401) {
                        msg = `Clearance Barrier — your authorization level does not include access to this crew member's personal duty schedule.`;
                    } else {
                        msg = detail || 'Operational Duty Window data synchronisation encountered a technical barrier.';
                    }

                    this._scheduleError.set(msg);
                    this._scheduleLoading.set(false);
                    return EMPTY;
                }),
                takeUntilDestroyed()
            )
            .subscribe((raw: Record<string, unknown>[]) => {
                const events = (raw ?? [])
                    .map(r => mapToScheduleEvent(r, memberId))
                    .map(dto => enrichEvent(dto, range.start))
                    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

                this._activeSchedule.set(events);
                this._scheduleLoading.set(false);
            });
    }

    /** Move to previous month/week and reload */
    navigatePeriodBack(): void {
        const range = this._scheduleDateRange();
        const view = this._calendarView();
        let newStart: Date;
        let newEnd: Date;

        if (view === 'monthly') {
            newStart = new Date(range.start.getFullYear(), range.start.getMonth() - 1, 1);
            newEnd = new Date(range.start.getFullYear(), range.start.getMonth(), 0);
        } else {
            newStart = new Date(range.start.getTime() - 7 * 86400000);
            newEnd = new Date(range.end.getTime() - 7 * 86400000);
        }

        this.updateDateRange({ start: newStart, end: newEnd });
    }

    /** Move to next month/week and reload */
    navigatePeriodForward(): void {
        const range = this._scheduleDateRange();
        const view = this._calendarView();
        let newStart: Date;
        let newEnd: Date;

        if (view === 'monthly') {
            newStart = new Date(range.start.getFullYear(), range.start.getMonth() + 1, 1);
            newEnd = new Date(range.start.getFullYear(), range.start.getMonth() + 2, 0);
        } else {
            newStart = new Date(range.start.getTime() + 7 * 86400000);
            newEnd = new Date(range.end.getTime() + 7 * 86400000);
        }

        this.updateDateRange({ start: newStart, end: newEnd });
    }

    /** Jump to current month */
    navigateToToday(): void {
        const now = new Date();
        this.updateDateRange({
            start: new Date(now.getFullYear(), now.getMonth(), 1),
            end: new Date(now.getFullYear(), now.getMonth() + 1, 0),
        });
    }

    /** Update range and trigger a re-fetch if a member is active */
    updateDateRange(range: IScheduleDateRange): void {
        this._scheduleDateRange.set(range);
        const id = this._focusedMemberId();
        if (id) this.loadSchedule(id, range);
    }

    setCalendarView(view: CalendarView): void {
        this._calendarView.set(view);
        // Adjust end date to week-end when switching to weekly
        const range = this._scheduleDateRange();
        const id = this._focusedMemberId();
        if (view === 'weekly') {
            const endOfWeek = new Date(range.start.getTime() + 6 * 86400000);
            this._scheduleDateRange.update(r => ({ ...r, end: endOfWeek }));
        }
        if (id) this.loadSchedule(id, this._scheduleDateRange());
    }

    clearSchedule(): void {
        this._activeSchedule.set([]);
        this._focusedMemberId.set(null);
        this._scheduleError.set(null);
        this._scheduleSuccess.set(null);
    }


    /** Maps raw crew data to ICrewAvailabilityResult with synthesised duty metrics */
    private enrichCrewMember(m: any): ICrewAvailabilityResult {
        const rank = this.inferCrewRank(m.position);
        const maxHours = rank === 'captain' ? 100 : rank === 'first-officer' ? 100 : 90;
        // Synthesise remaining hours from employee ID hash (deterministic fake data for UI)
        const seed = m.employeeId % 100;
        const used = Math.round((seed / 100) * maxHours);
        const remaining = maxHours - used;
        const pct = Math.round((used / maxHours) * 100);
        const status: 'ready' | 'limited' | 'unavailable' =
            pct < 60 ? 'ready' : pct < 85 ? 'limited' : 'unavailable';

        return {
            employeeId: m.employeeId,
            fullName: m.fullName,
            position: m.position,
            baseAirportIata: m.crewBaseAirportIata ?? m.baseAirportIata ?? 'SIN',
            email: m.email ?? `${m.employeeId}@asiaporeair.com`,
            isActive: m.isActive ?? true,
            appUserId: m.appUserId ?? '',
            rank,
            availabilityStatus: (m.isActive ?? true) ? status : 'unavailable',
            remainingDutyHours: remaining,
            maxDutyHours: maxHours,
            dutyHoursPercent: pct,
        };
    }

    private inferCrewRank(position: string): CrewRank {
        const p = (position ?? '').toLowerCase();
        if (p.includes('captain')) return 'captain';
        if (p.includes('first officer')) return 'first-officer';
        if (p.includes('lead purser')) return 'lead-purser';
        if (p.includes('purser')) return 'purser';
        if (p.includes('senior')) return 'senior-attendant';
        if (p.includes('pilot')) return 'first-officer';
        return 'attendant';
    }

    private matchesRank(position: string, rank: CrewRank): boolean {
        return this.inferCrewRank(position) === rank;
    }

    private isPilotRank(rank: CrewRank): boolean {
        return rank === 'captain' || rank === 'first-officer';
    }
}



// Utility: map raw API response entry to IScheduleEventDto
function mapToScheduleEvent(raw: Record<string, unknown>, employeeId: number): IScheduleEventDto {
    const rawType = ((raw['type'] ?? raw['eventType'] ?? 'flight') as string).toLowerCase();
    const dutyTypeMap: Record<string, DutyEventType> = {
        flight: 'flight', standby: 'standby', training: 'training',
        rest: 'rest', off: 'off', ground: 'ground', medical: 'medical', simulator: 'simulator',
    };
    return {
        eventId: (raw['eventId'] ?? raw['id'] ?? Math.random()) as number,
        employeeId,
        type: dutyTypeMap[rawType] ?? 'flight',
        title: (raw['title'] ?? raw['flightNo'] ?? 'Duty Event') as string,
        startTime: (raw['startTime'] ?? raw['scheduledDepartureTime'] ?? raw['start']) as string,
        endTime: (raw['endTime'] ?? raw['scheduledArrivalTime'] ?? raw['end']) as string,
        status: (raw['status'] ?? 'Scheduled') as string,
        flightNo: raw['flightNo'] as string | undefined,
        originIata: (raw['originIata'] ?? raw['originAirportIata']) as string | undefined,
        destinationIata: (raw['destinationIata'] ?? raw['destinationAirportIata']) as string | undefined,
        aircraftTailNo: (raw['aircraftTailNo'] ?? raw['tailNumber']) as string | undefined,
        notes: raw['notes'] as string | undefined,
    };
}

function enrichEvent(dto: IScheduleEventDto, rangeStart: Date): IScheduleDutyEvent {
    const start = new Date(dto.startTime);
    const end = new Date(dto.endTime);
    const durationMs = end.getTime() - start.getTime();
    const durationMins = Math.round(durationMs / 60000);
    const daysSinceRangeStart = Math.floor((start.getTime() - rangeStart.getTime()) / 86400000);
    const dayIndex = start.getDay();
    const weekRow = Math.floor(daysSinceRangeStart / 7);
    const spanDays = Math.max(1, Math.ceil(durationMs / 86400000));
    return {
        raw: dto,
        startDate: start,
        endDate: end,
        durationMinutes: durationMins,
        dayIndex,
        weekRow,
        isMultiDay: spanDays > 1,
        spanDays,
    };
}