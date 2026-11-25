

import { Injectable, computed, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import {
    Subject, switchMap, tap, catchError, of, debounceTime, EMPTY, forkJoin,
} from 'rxjs';

import { EmployeeService, IPaginatedResult } from '@shared-core';
import {
    IEmployeeFilterDto,
    IEmployeeSummaryDto,
    IEmployeeAnalyticsDto,
    IUpdateSalaryRequestDto,
    EmployeeStatus,
} from './employee.model';
import { UserRole } from '../../../../core/auth/roles.model';


import { AuthService } from '@shared-core';
import { AirportsService } from '@shared-core';
import { AircraftTypesService } from '@shared-core';
import { IAirportDto } from '@shared-core';
import { IAircraftTypeDto } from '@shared-core';
import {
    SuperAdminDto, AdminDto, SupervisorDto, PilotDto, AttendantDto,
    AnyUserProfileDto, PilotProfileDto, AttendantProfileDto,
    AdminProfileDto, SupervisorProfileDto, SuperAdminProfileDto,
    UpdatePilotProfileDto, UpdateAttendantProfileDto,
    UpdateAdminProfileDto, UpdateSupervisorProfileDto, UpdateSuperAdminProfileDto,
} from '@shared-core';
import { Observable } from 'rxjs';

// ── Route base path ────────────────────────────────────────────────────────
const WDO_BASE = 'aoms/workforce-intelligence/workforce-directory';

// ── Filter shape ──────────────────────────────────────────────────────────
export interface IWdoFilters {
    role: string;
    search: string;
    status: EmployeeStatus | '';
}

// ── Pagination shape ───────────────────────────────────────────────────────
export interface IWdoPagination {
    total: number;
    page: number;
    size: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}


export type OnboardingRole =
    | 'SuperAdmin'
    | 'Admin'
    | 'Supervisor'
    | 'Pilot'
    | 'Attendant';

export type OnboardingStep = 0 | 1 | 2;   // 0=Role, 1=Form, 2=Success

export type UpdateStatus = 'idle' | 'busy' | 'success' | 'error';

/** Role keys that the access manager understands */
export type TechnicalRole =
    | 'superadmin'
    | 'admin'
    | 'supervisor'
    | 'pilot'
    | 'attendant';

export interface IOnboardingPayload {
    role: OnboardingRole;
    // Union of all possible DTO fields — the store discriminates on role
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    dateOfHire?: string;
    salary?: number;
    dateOfBirth?: string;
    address?: string;
    profilePicture?: File;
    // SuperAdmin only
    password?: string;
    confirmPassword?: string;
    // Admin only
    department?: string;
    // Pilot & Attendant
    crewBaseAirport?: string;
    // Pilot only
    licenseNumber?: string;
    totalFlightHours?: number;
    aircraftTypeId?: number;
    lastSimCheckDate?: string;
}

/**
 * Generic profile update payload —
 * the component passes this; the store discriminates on the role signal.
 */
export interface IProfileUpdatePayload {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    dateOfBirth?: string;
    address?: string;
    profilePicture?: File;
    dateOfHire?: string;
    salary?: number;
    // Admin
    department?: string;
    // Supervisor
    managedArea?: string;
    // Pilot
    crewBaseAirport?: string;
    licenseNumber?: string;
    totalFlightHours?: number;
    lastSimCheckDate?: string;
    // Attendant
    // crewBaseAirport also applies
}

// ── Load trigger payload ───────────────────────────────────────────────────
interface ILoadPayload {
    filters: IWdoFilters;
    page: number;
    size: number;
}

const DEFAULT_FILTERS: IWdoFilters = { role: '', search: '', status: '' };
const DEFAULT_PAGINATION: IWdoPagination = {
    total: 0, page: 1, size: 20,
    totalPages: 0, hasNext: false, hasPrev: false,
};

@Injectable({ providedIn: 'root' })
export class WorkforceWdoStore {
    private readonly employeeService = inject(EmployeeService);
    private readonly router = inject(Router);
    private readonly destroyRef = inject(DestroyRef);

    private readonly authService = inject(AuthService);
    private readonly airportsService = inject(AirportsService);
    private readonly aircraftTypesService = inject(AircraftTypesService);

    // ── Private Writable Signals ────────────────────────────────────────
    private readonly _employees = signal<IEmployeeSummaryDto[]>([]);
    private readonly _analytics = signal<IEmployeeAnalyticsDto | null>(null);
    private readonly _pagination = signal<IWdoPagination>(DEFAULT_PAGINATION);
    private readonly _filters = signal<IWdoFilters>(DEFAULT_FILTERS);
    private readonly _loading = signal<boolean>(false);
    private readonly _analyticsLoading = signal<boolean>(false);
    private readonly _error = signal<string | null>(null);
    private readonly _analyticsError = signal<string | null>(null);
    private readonly _actionError = signal<string | null>(null);
    private readonly _actionProcessing = signal<boolean>(false);
    private readonly _actionSuccess = signal<string | null>(null);
    /** The employee currently being acted upon (deactivate / salary) */
    private readonly _focusedEmployeeId = signal<number | null>(null);


    // ── Profile Hub State ───────────────────────────────────────────────
    private readonly _selectedEmployee = signal<IEmployeeSummaryDto | null>(null);
    private readonly _isLoadingProfile = signal<boolean>(false);
    private readonly _profileLoadError = signal<string | null>(null);
    private readonly _isOperating = signal<boolean>(false);
    private readonly _hrActionError = signal<string | null>(null);
    private readonly _hrActionSuccess = signal<string | null>(null);


    // ── Onboarding Wizard State ─────────────────────────────────────────
    private readonly _onboardingStep = signal<OnboardingStep>(0);
    private readonly _selectedRole = signal<OnboardingRole | null>(null);
    private readonly _availableAirports = signal<IAirportDto[]>([]);
    private readonly _availableAircraftTypes = signal<IAircraftTypeDto[]>([]);
    private readonly _isLoadingSupport = signal<boolean>(false);
    private readonly _isSubmitting = signal<boolean>(false);
    private readonly _onboardingFeedback = signal<{
        type: 'success' | 'error';
        message: string;
        employeeId?: string;
    } | null>(null);
    private readonly _supportDataLoaded = signal<boolean>(false);


    // ── System Access Manager State ─────────────────────────────────────
    private readonly _technicalProfile = signal<AnyUserProfileDto | null>(null);
    private readonly _activeTechnicalId = signal<string | null>(null);
    private readonly _activeTechnicalRole = signal<TechnicalRole | null>(null);
    private readonly _airportsList = signal<IAirportDto[]>([]);
    private readonly _aircraftTypesList = signal<IAircraftTypeDto[]>([]);
    private readonly _updateStatus = signal<UpdateStatus>('idle');
    private readonly _backendErrorMessage = signal<string | null>(null);
    private readonly _updateSuccessMessage = signal<string | null>(null);
    private readonly _isLoadingTechProfile = signal<boolean>(false);
    private readonly _techProfileLoadError = signal<string | null>(null);
    private readonly _opDepsLoaded = signal<boolean>(false);


    // ── RxJS Load Subject (debounced) ─────────────────────────────────
    private readonly _loadTrigger$ = new Subject<ILoadPayload>();

    constructor() {
        // ── Employee List Pipeline ─────────────────────────────────────
        this._loadTrigger$
            .pipe(
                debounceTime(150),
                tap(() => {
                    this._loading.set(true);
                    this._error.set(null);
                }),
                switchMap(({ filters, page, size }) => {
                    const dto: IEmployeeFilterDto = {
                        ...(filters.role ? { role: filters.role } : {}),
                        ...(filters.search ? { search: filters.search } : {}),
                        ...(filters.status ? { status: filters.status } : {}),
                    };
                    return this.employeeService
                        .getEmployeesPaginated(dto, page, size)
                        .pipe(
                            catchError(err => {
                                this._error.set(
                                    err?.message ??
                                    'Workforce data synchronization encountered a technical barrier.'
                                );
                                const empty: IPaginatedResult<IEmployeeSummaryDto> = {
                                    items: [], totalCount: 0, pageNumber: page,
                                    pageSize: size, totalPages: 0,
                                    hasPreviousPage: false, hasNextPage: false,
                                };
                                return of(empty);
                            })
                        );
                }),
                tap(() => this._loading.set(false)),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe((result: any) => {
                const items: IEmployeeSummaryDto[] = (result.items ?? []).map((s: any) => this._mapEmployee(s));
                this._employees.set(items);
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

    private _mapEmployee(s: any): IEmployeeSummaryDto {
        const nameParts = (s.fullName || '').trim().split(/\s+/);
        const firstName = s.firstName || nameParts[0] || 'Unknown';
        const lastName = s.lastName || (nameParts.length > 1 ? nameParts.slice(1).join(' ') : '');
        const salary = typeof s.salary === 'number' ? s.salary : parseFloat(s.salary) || 0;
        const isActive = s.isActive ?? (s.status === 'Active');
        const appUserId = (s.appUserId ?? s.userId ?? s.app_user_id ?? '').toString();
        const crewBaseAirportIata = s.crewBaseAirportIata ?? s.crewBaseAirport ?? s.crewBaseAirportId ?? '';
        const dateOfHire = (s.dateOfHire ?? s.hireDate ?? s.hiredDate ?? '')?.toString();
        const position = s.position ?? s.jobTitle ?? s.rank ?? '';

        return {
            ...s,
            employeeId: s.employeeId,
            appUserId,
            firstName,
            lastName,
            fullName: s.fullName || `${firstName} ${lastName}`.trim(),
            email: s.email,
            userType: s.role as UserRole,
            role: s.role,
            department: s.department,
            isActive,
            baseSalary: s.baseSalary ?? salary,
            hireDate: dateOfHire,
            // Compatibility fields
            salary,
            status: (isActive ? 'Active' : 'Inactive') as EmployeeStatus,
            dateOfHire,
            crewBaseAirportIata,
            crewBaseAirport: s.crewBaseAirport ?? crewBaseAirportIata,
            position,
        };
    }

    // ── Public Read-Only Signals ──────────────────────────────────────
    readonly employees = this._employees.asReadonly();
    readonly analytics = this._analytics.asReadonly();
    readonly pagination = this._pagination.asReadonly();
    readonly filters = this._filters.asReadonly();
    readonly loading = this._loading.asReadonly();
    readonly analyticsLoading = this._analyticsLoading.asReadonly();
    readonly error = this._error.asReadonly();
    readonly analyticsError = this._analyticsError.asReadonly();
    readonly actionError = this._actionError.asReadonly();
    readonly actionProcessing = this._actionProcessing.asReadonly();
    readonly actionSuccess = this._actionSuccess.asReadonly();
    readonly focusedEmployeeId = this._focusedEmployeeId.asReadonly();

    readonly selectedEmployee = this._selectedEmployee.asReadonly();
    readonly isLoadingProfile = this._isLoadingProfile.asReadonly();
    readonly profileLoadError = this._profileLoadError.asReadonly();
    readonly isOperating = this._isOperating.asReadonly();
    readonly hrActionError = this._hrActionError.asReadonly();
    readonly hrActionSuccess = this._hrActionSuccess.asReadonly();


    readonly onboardingStep = this._onboardingStep.asReadonly();
    readonly selectedRole = this._selectedRole.asReadonly();
    readonly availableAirports = this._availableAirports.asReadonly();
    readonly availableAircraftTypes = this._availableAircraftTypes.asReadonly();
    readonly isLoadingSupport = this._isLoadingSupport.asReadonly();
    readonly isSubmitting = this._isSubmitting.asReadonly();
    readonly onboardingFeedback = this._onboardingFeedback.asReadonly();
    readonly supportDataLoaded = this._supportDataLoaded.asReadonly();


    readonly technicalProfile = this._technicalProfile.asReadonly();
    readonly activeTechnicalRole = this._activeTechnicalRole.asReadonly();
    readonly airportsList = this._airportsList.asReadonly();
    readonly aircraftTypesList = this._aircraftTypesList.asReadonly();
    readonly updateStatus = this._updateStatus.asReadonly();
    readonly backendErrorMessage = this._backendErrorMessage.asReadonly();
    readonly updateSuccessMessage = this._updateSuccessMessage.asReadonly();
    readonly isLoadingTechProfile = this._isLoadingTechProfile.asReadonly();
    readonly techProfileLoadError = this._techProfileLoadError.asReadonly();

    /** Computed page numbers for pagination ellipsis rendering */
    readonly pageNumbers = computed<number[]>(() => {
        const p = this._pagination();
        if (!p.totalPages) return [];
        const curr = p.page;
        const total = p.totalPages;
        if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
        const pages: number[] = [1];
        if (curr > 3) pages.push(-1);
        for (let i = Math.max(2, curr - 1); i <= Math.min(total - 1, curr + 1); i++) {
            pages.push(i);
        }
        if (curr < total - 2) pages.push(-2);
        pages.push(total);
        return pages;
    });

    // ── Actions ───────────────────────────────────────────────────────

    /** Initial / refresh load */
    loadEmployees(page = 1): void {
        this._loadTrigger$.next({
            filters: this._filters(), page, size: this._pagination().size,
        });
    }

    /** Update one or more filter fields and reload from page 1 */
    updateFilters(partial: Partial<IWdoFilters>): void {
        this._filters.update(f => ({ ...f, ...partial }));
        this._loadTrigger$.next({
            filters: this._filters(), page: 1, size: this._pagination().size,
        });
    }

    resetFilters(): void {
        this._filters.set({ ...DEFAULT_FILTERS });
        this._loadTrigger$.next({
            filters: DEFAULT_FILTERS, page: 1, size: this._pagination().size,
        });
    }

    /** Pagination */
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

    /** Load workforce analytics KPIs */
    loadWorkforceAnalytics(): void {
        this._analyticsLoading.set(true);
        this._analyticsError.set(null);

        this.employeeService.getEmployeeDashboardAnalytics()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (shared: any) => {
                    const analytics: IEmployeeAnalyticsDto = {
                        totalEmployees: shared.totalActiveEmployees ?? 0,
                        totalPilots: shared.totalPilots ?? 0,
                        totalAttendants: shared.totalAttendants ?? 0,
                        totalAdmins: shared.totalAdmins ?? 0,
                        totalSupervisors: shared.totalSupervisors ?? 0,
                        totalSuperAdmins: 0, // Not currently tracked in backend summary
                        activeCount: shared.totalActiveEmployees ?? 0,
                        inactiveCount: 0,
                        onLeaveCount: 0,
                    };
                    this._analytics.set(analytics);
                    this._analyticsLoading.set(false);
                },
                error: err => {
                    this._analyticsError.set(
                        err?.message ?? 'Analytics data temporarily unavailable.'
                    );
                    this._analyticsLoading.set(false);
                },
            });
    }

    /** Deactivate an employee account */
    deactivateAccount(employeeId: number): Promise<boolean> {
        return this.toggleStatus(employeeId, false);
    }

    /** Reactivate an employee account */
    reactivateAccount(employeeId: number): Promise<boolean> {
        return this.toggleStatus(employeeId, true);
    }

    /** Salary update */
    updateSalary(employeeId: number, dto: IUpdateSalaryRequestDto): Promise<boolean> {
        return this.adjustSalary(employeeId, dto.newSalary, dto.reason);
    }

    clearActionState(): void {
        this._actionError.set(null);
        this._actionSuccess.set(null);
        this._focusedEmployeeId.set(null);
    }


    // ===========================================================================
    // EMPLOYEE PROFILE HUB ACTIONS
    // ===========================================================================

    /**
     * Loads a full employee profile by their numeric employeeId.
     * Uses getEmployeeSummaryById as the primary source.
     */
    fetchProfile(employeeId: number): void {
        this._isLoadingProfile.set(true);
        this._profileLoadError.set(null);
        this._selectedEmployee.set(null);
        this._hrActionError.set(null);

        this.employeeService.getEmployeeSummaryById(employeeId)
            .pipe(
                catchError(err => {
                    const code = err?.status;
                    let msg: string;
                    if (code === 403 || code === 401) {
                        msg = 'Insufficient Permissions — your security clearance does not permit access to this personnel record.';
                    } else if (code === 404) {
                        msg = `Employee record #${employeeId} could not be located. The profile may have been archived.`;
                    } else {
                        msg = err?.message ?? 'Personnel data synchronization encountered a technical barrier.';
                    }
                    this._profileLoadError.set(msg);
                    this._isLoadingProfile.set(false);
                    return EMPTY;
                }),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe((s: any) => {
                this._selectedEmployee.set(this._mapEmployee(s));
                this._isLoadingProfile.set(false);
            });
    }

    /**
     * Adjusts the employee's salary.
     * HTTP 400 → "Invalid Salary Range" concierge message.
     * HTTP 403 → "Insufficient Permissions" escalation message.
     */
    adjustSalary(employeeId: number, newSalary: number, reason?: string): Promise<boolean> {
        this._isOperating.set(true);
        this._hrActionError.set(null);
        this._hrActionSuccess.set(null);

        const dto: IUpdateSalaryRequestDto = {
            newSalary,
            effectiveDate: new Date().toISOString(),
            reason: reason ?? 'Administrative salary adjustment',
        };

        return new Promise(resolve => {
            this.employeeService.updateEmployeeSalary(employeeId, dto)
                .pipe(
                    catchError(err => {
                        const code = err?.status;
                        let msg: string;
                        if (code === 400) {
                            msg = `Invalid Salary Range — the proposed figure falls outside the approved compensation band for this role. Please review and resubmit.`;
                        } else if (code === 403) {
                            msg = `Insufficient Permissions — salary adjustments for this role require elevated authorization.`;
                        } else {
                            msg = err?.error?.message ?? err?.message ??
                                'Compensation update encountered a technical barrier.';
                        }
                        this._hrActionError.set(msg);
                        this._isOperating.set(false);
                        resolve(false);
                        return EMPTY;
                    }),
                    takeUntilDestroyed(this.destroyRef)
                )
                .subscribe(s => {
                    const mapped = this._mapEmployee(s);
                    this._selectedEmployee.set(mapped);
                    // Also patch in the employees list if present
                    this._employees.update(list =>
                        list.map(e => e.employeeId === employeeId ? mapped : e)
                    );

                    const msg = 'Compensation record updated successfully. Effective immediately.';
                    this._hrActionSuccess.set(msg);
                    this._actionSuccess.set(msg);

                    this._isOperating.set(false);
                    this._actionProcessing.set(false);

                    setTimeout(() => {
                        this._hrActionSuccess.set(null);
                        this._actionSuccess.set(null);
                    }, 4000);
                    resolve(true);
                });
        });
    }

    /**
     * Toggles the employee's active status.
     * `activate: true`  → calls reactivateEmployee
     * `activate: false` → calls deactivateEmployee
     */
    toggleStatus(employeeId: number, activate: boolean): Promise<boolean> {
        this._isOperating.set(true);
        this._hrActionError.set(null);
        this._hrActionSuccess.set(null);

        const call$ = activate
            ? this.employeeService.reactivateEmployee(employeeId)
            : this.employeeService.deactivateEmployee(employeeId);

        return new Promise(resolve => {
            call$.pipe(
                catchError(err => {
                    const code = err?.status;
                    let msg: string;
                    if (code === 409 && !activate) {
                        msg = `Deactivation Blocked — this employee is assigned to active flight operations. Release all scheduling assignments before decommissioning.`;
                    } else if (code === 403) {
                        msg = `Insufficient Permissions — account lifecycle operations require SuperAdmin authorization.`;
                    } else {
                        msg = err?.error?.message ?? err?.message ??
                            `Account ${activate ? 'reactivation' : 'deactivation'} encountered a technical barrier.`;
                    }
                    this._hrActionError.set(msg);
                    this._isOperating.set(false);
                    resolve(false);
                    return EMPTY;
                }),
                takeUntilDestroyed(this.destroyRef)
            ).subscribe(() => {
                // Patch the local profile signal
                this._selectedEmployee.update(emp =>
                    emp ? { ...emp, isActive: activate, status: (activate ? 'Active' : 'Inactive') as EmployeeStatus } : emp
                );
                // Patch the directory list too
                this._employees.update(list =>
                    list.map(e => e.employeeId === employeeId
                        ? { ...e, isActive: activate, status: (activate ? 'Active' : 'Inactive') as EmployeeStatus }
                        : e
                    )
                );

                const msg = activate
                    ? 'Account reactivated. Full system access has been restored.'
                    : 'Account deactivated. All system access has been revoked immediately.';

                this._actionSuccess.set(msg); // sync the legacy signals too
                this._hrActionSuccess.set(msg);
                this._isOperating.set(false);
                this._actionProcessing.set(false);
                this._focusedEmployeeId.set(null);

                setTimeout(() => {
                    this._hrActionSuccess.set(null);
                    this._actionSuccess.set(null);
                }, 4000);
                resolve(true);
            });
        });
    }

    clearHrActionState(): void {
        this._hrActionError.set(null);
        this._hrActionSuccess.set(null);
    }

    clearProfile(): void {
        this._selectedEmployee.set(null);
        this._profileLoadError.set(null);
        this._hrActionError.set(null);
        this._hrActionSuccess.set(null);
    }


    // ===========================================================================
    // ONBOARDING WIZARD ACTIONS
    // ===========================================================================

    /**
     * Loads airports + aircraft types in parallel.
     * Uses a cache-first approach via _supportDataLoaded.
     */
    loadSupportingData(): void {
        if (this._supportDataLoaded()) return;  // cache-first
        this._isLoadingSupport.set(true);

        forkJoin({
            airports: this.airportsService.getAllActiveAirports(),
            aircraftTypes: this.aircraftTypesService.getAllActiveAircraftTypes(),
        })
            .pipe(
                catchError(err => {
                    console.warn('[WDO Store] Support data load failed:', err?.message);
                    return of({ airports: [], aircraftTypes: [] });
                }),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe(({ airports, aircraftTypes }) => {
                this._availableAirports.set(airports);
                this._availableAircraftTypes.set(aircraftTypes);
                this._isLoadingSupport.set(false);
                this._supportDataLoaded.set(true);
            });
    }

    /** Step 1 → Step 2: sets the role and advances */
    setRole(role: OnboardingRole): void {
        this._selectedRole.set(role);
        this._onboardingStep.set(1);
        this._onboardingFeedback.set(null);
    }

    /** Step 2 → Step 1 (back button) */
    goBackToRoleSelection(): void {
        this._onboardingStep.set(0);
        this._onboardingFeedback.set(null);
    }

    /** Resets the wizard to Step 0 for a fresh onboarding */
    resetOnboarding(): void {
        this._onboardingStep.set(0);
        this._selectedRole.set(null);
        this._onboardingFeedback.set(null);
    }


    async executeRegistration(payload: IOnboardingPayload): Promise<void> {
        this._isSubmitting.set(true);
        this._onboardingFeedback.set(null);

        const role = payload.role;
        let call$: Observable<string>;

        switch (role) {
            case 'SuperAdmin':
                call$ = this.authService.registerSuperAdmin({
                    firstName: payload.firstName,
                    lastName: payload.lastName,
                    email: payload.email,
                    phoneNumber: payload.phoneNumber,
                    dateOfHire: payload.dateOfHire,
                    salary: payload.salary,
                    dateOfBirth: payload.dateOfBirth,
                    address: payload.address,
                    profilePicture: payload.profilePicture,
                    password: payload.password!,
                    confirmPassword: payload.confirmPassword!,
                });
                break;

            case 'Admin':
                call$ = this.authService.registerAdmin({
                    firstName: payload.firstName,
                    lastName: payload.lastName,
                    email: payload.email,
                    phoneNumber: payload.phoneNumber,
                    dateOfHire: payload.dateOfHire,
                    salary: payload.salary,
                    dateOfBirth: payload.dateOfBirth,
                    address: payload.address,
                    profilePicture: payload.profilePicture,
                    department: payload.department,
                });
                break;

            case 'Supervisor':
                call$ = this.authService.registerSupervisor({
                    firstName: payload.firstName,
                    lastName: payload.lastName,
                    email: payload.email,
                    phoneNumber: payload.phoneNumber,
                    dateOfHire: payload.dateOfHire,
                    salary: payload.salary,
                    dateOfBirth: payload.dateOfBirth,
                    address: payload.address,
                    profilePicture: payload.profilePicture,
                });
                break;

            case 'Pilot':
                const pilotData: PilotDto = {
                    firstName: payload.firstName,
                    lastName: payload.lastName,
                    email: payload.email,
                    phoneNumber: payload.phoneNumber,
                    dateOfHire: payload.dateOfHire,
                    salary: payload.salary,
                    dateOfBirth: payload.dateOfBirth,
                    address: payload.address,
                    profilePicture: payload.profilePicture,
                    crewBaseAirport: payload.crewBaseAirport!,
                    licenseNumber: payload.licenseNumber!,
                    totalFlightHours: payload.totalFlightHours,
                    aircraftTypeId: payload.aircraftTypeId!,
                    lastSimCheckDate: payload.lastSimCheckDate,
                };
                call$ = this.authService.registerPilot(pilotData);
                break;

            case 'Attendant':
            default:
                const attendantData: AttendantDto = {
                    firstName: payload.firstName,
                    lastName: payload.lastName,
                    email: payload.email,
                    phoneNumber: payload.phoneNumber,
                    dateOfHire: payload.dateOfHire,
                    salary: payload.salary,
                    dateOfBirth: payload.dateOfBirth,
                    address: payload.address,
                    profilePicture: payload.profilePicture,
                    crewBaseAirport: payload.crewBaseAirport!,
                };
                call$ = this.authService.registerAttendant(attendantData);
                break;

        }

        call$.pipe(
            catchError(err => {
                const code = err?.status;
                const detail = err?.error?.message ?? err?.message ?? '';
                let msg: string;

                if (code === 409) {
                    msg = `Email Configuration Conflict — the address "${payload.email}" is already registered in the personnel system.`;
                } else if (code === 400) {
                    msg = `Registration Validation Failure — ${detail || 'one or more fields did not meet system requirements.'}`;
                } else if (code === 403) {
                    msg = `Insufficient Authorization — your security clearance cannot register this account type.`;
                } else {
                    msg = detail || 'Account registration encountered a technical barrier. Please retry or contact system administration.';
                }

                this._onboardingFeedback.set({ type: 'error', message: msg });
                this._isSubmitting.set(false);
                return EMPTY;
            }),
            takeUntilDestroyed(this.destroyRef)
        ).subscribe((message: string) => {
            this._onboardingFeedback.set({
                type: 'success',
                message: message || `Welcome to the Fleet — ${payload.firstName} ${payload.lastName} has been successfully onboarded.`,
            });
            this._onboardingStep.set(2);
            this._isSubmitting.set(false);
            // Refresh the employee list in the background
            this.loadEmployees(1);
        });
    }

    // ===========================================================================
    // SYSTEM ACCESS MANAGER ACTIONS
    // ===========================================================================

    /**
     * Loads the full technical profile for an employee using their
     * app user ID (UUID string) and role.
     * Routes to the correct role-specific endpoint.
     */
    loadTechnicalData(appUserId: string, role: TechnicalRole): void {
        this._isLoadingTechProfile.set(true);
        this._techProfileLoadError.set(null);
        this._technicalProfile.set(null);
        this._activeTechnicalId.set(appUserId);
        this._activeTechnicalRole.set(role);
        this._backendErrorMessage.set(null);
        this._updateStatus.set('idle');

        let call$: Observable<AnyUserProfileDto>;

        switch (role) {
            case 'superadmin': call$ = this.authService.getSuperAdminProfile(appUserId); break;
            case 'admin': call$ = this.authService.getAdminProfile(appUserId); break;
            case 'supervisor': call$ = this.authService.getSupervisorProfile(appUserId); break;
            case 'pilot': call$ = this.authService.getPilotProfile(appUserId); break;
            case 'attendant':
            default: call$ = this.authService.getAttendantProfile(appUserId); break;
        }

        call$.pipe(
            catchError(err => {
                const code = err?.status;
                let msg: string;
                if (code === 403 || code === 401) {
                    msg = 'Insufficient Security Clearance — your authorization level does not permit access to this technical profile.';
                } else if (code === 404) {
                    msg = `Technical profile not found. The account may have been archived or the role mapping is incorrect.`;
                } else {
                    msg = err?.message ?? 'Technical profile synchronization encountered a barrier.';
                }
                this._techProfileLoadError.set(msg);
                this._isLoadingTechProfile.set(false);
                return EMPTY;
            }),
            takeUntilDestroyed(this.destroyRef)
        ).subscribe((profile: any) => {
            const normalized = {
                ...profile,
                dateCreated:
                    profile?.dateCreated ??
                    profile?.createdAt ??
                    profile?.createdDate ??
                    profile?.creationDate ??
                    null,
                dateOfBirth:
                    profile?.dateOfBirth ??
                    profile?.birthDate ??
                    profile?.dob ??
                    null,
                dateOfHire:
                    profile?.dateOfHire ??
                    profile?.hireDate ??
                    profile?.hiredDate ??
                    null,
            } as AnyUserProfileDto;
            this._technicalProfile.set(normalized);
            this._isLoadingTechProfile.set(false);
        });
    }

    /**
     * Parallel fetch of airports and aircraft types.
     * Cache-first: if already loaded (_opDepsLoaded), skips the network call.
     */
    fetchOperationalDependencies(): void {
        if (this._opDepsLoaded()) return;

        forkJoin({
            airports: this.airportsService.getAllActiveAirports(),
            aircraftTypes: this.aircraftTypesService.getAllActiveAircraftTypes(),
        })
            .pipe(
                catchError(err => {
                    console.warn('[SAM Store] Operational dependency fetch failed:', err?.message);
                    return of({ airports: [], aircraftTypes: [] });
                }),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe(({ airports, aircraftTypes }) => {
                this._airportsList.set(airports);
                this._aircraftTypesList.set(aircraftTypes);
                this._opDepsLoaded.set(true);
            });
    }


    commitProfileUpdate(payload: IProfileUpdatePayload): Promise<boolean> {
        const id = this._activeTechnicalId();
        const role = this._activeTechnicalRole();

        if (!id || !role) return Promise.resolve(false);

        this._updateStatus.set('busy');
        this._backendErrorMessage.set(null);
        this._updateSuccessMessage.set(null);

        let call$: Observable<string>;

        switch (role) {
            case 'superadmin':
                call$ = this.authService.updateSuperAdminProfile({
                    firstName: payload.firstName,
                    lastName: payload.lastName,
                    phoneNumber: payload.phoneNumber,
                    dateOfBirth: payload.dateOfBirth,
                    address: payload.address,
                    profilePicture: payload.profilePicture,
                    dateOfHire: payload.dateOfHire,
                    salary: payload.salary,
                });
                break;

            case 'admin':
                call$ = this.authService.updateAdminProfile(id, {
                    firstName: payload.firstName,
                    lastName: payload.lastName,
                    phoneNumber: payload.phoneNumber,
                    dateOfBirth: payload.dateOfBirth,
                    address: payload.address,
                    profilePicture: payload.profilePicture,
                    dateOfHire: payload.dateOfHire,
                    salary: payload.salary,
                    department: payload.department,
                });
                break;

            case 'supervisor':
                call$ = this.authService.updateSupervisorProfile(id, {
                    firstName: payload.firstName,
                    lastName: payload.lastName,
                    phoneNumber: payload.phoneNumber,
                    dateOfBirth: payload.dateOfBirth,
                    address: payload.address,
                    profilePicture: payload.profilePicture,
                    dateOfHire: payload.dateOfHire,
                    salary: payload.salary,
                    managedArea: payload.managedArea,
                });
                break;

            case 'pilot':
                call$ = this.authService.updatePilotProfile(id, {
                    firstName: payload.firstName,
                    lastName: payload.lastName,
                    phoneNumber: payload.phoneNumber,
                    dateOfBirth: payload.dateOfBirth,
                    address: payload.address,
                    profilePicture: payload.profilePicture,
                    dateOfHire: payload.dateOfHire,
                    salary: payload.salary,
                    crewBaseAirport: payload.crewBaseAirport,
                    licenseNumber: payload.licenseNumber,
                    totalFlightHours: payload.totalFlightHours,
                    lastSimCheckDate: payload.lastSimCheckDate,
                });
                break;

            case 'attendant':
            default:
                call$ = this.authService.updateAttendantProfile(id, {
                    firstName: payload.firstName,
                    lastName: payload.lastName,
                    phoneNumber: payload.phoneNumber,
                    dateOfBirth: payload.dateOfBirth,
                    address: payload.address,
                    profilePicture: payload.profilePicture,
                    dateOfHire: payload.dateOfHire,
                    salary: payload.salary,
                    crewBaseAirport: payload.crewBaseAirport,
                });
                break;
        }

        return new Promise(resolve => {
            call$.pipe(
                catchError(err => {
                    const code = err?.status;
                    const detail = err?.error?.message ?? err?.message ?? '';
                    let msg: string;

                    if (code === 409) {
                        msg = `API Conflict: ${detail || 'The selected resource is currently at capacity or has an active dependency constraint.'}`;
                    } else if (code === 400) {
                        msg = `Validation Failure: ${detail || 'One or more field values did not meet system requirements.'}`;
                    } else if (code === 403) {
                        msg = `Clearance Barrier: The selected resource requires a higher authorization level than currently assigned to this account.`;
                    } else if (code === 404) {
                        msg = `Record Not Found: The profile could not be located for update. It may have been archived.`;
                    } else {
                        msg = detail || 'Profile update encountered an unexpected technical barrier.';
                    }

                    this._backendErrorMessage.set(msg);
                    this._updateStatus.set('error');
                    resolve(false);
                    return EMPTY;
                }),
                takeUntilDestroyed(this.destroyRef)
            ).subscribe(message => {
                // Patch the technical profile locally
                this._technicalProfile.update(p => {
                    if (!p) return p;
                    return {
                        ...p,
                        firstName: payload.firstName ?? p.firstName,
                        lastName: payload.lastName ?? p.lastName,
                        phoneNumber: payload.phoneNumber ?? p.phoneNumber,
                        address: payload.address ?? p.address,
                    };
                });
                this._updateStatus.set('success');
                this._updateSuccessMessage.set(
                    message || 'System access credentials synchronized successfully.'
                );
                resolve(true);
                // Auto-reset status after 4s
                setTimeout(() => {
                    this._updateStatus.set('idle');
                    this._updateSuccessMessage.set(null);
                }, 4000);
            });
        });
    }

    clearSamState(): void {
        this._technicalProfile.set(null);
        this._activeTechnicalId.set(null);
        this._activeTechnicalRole.set(null);
        this._backendErrorMessage.set(null);
        this._updateStatus.set('idle');
        this._techProfileLoadError.set(null);
        this._updateSuccessMessage.set(null);
    }

    clearSamError(): void {
        this._backendErrorMessage.set(null);
        if (this._updateStatus() === 'error') this._updateStatus.set('idle');
    }

    // ── Navigation ─────────────────────────────────────────────────────

    navigateToProfile(employeeId: number): void {
        this.router.navigate([WDO_BASE, 'profile-hub', employeeId]);
    }

    navigateToAccessManager(appUserId: string, role: string): void {
        const normalizedRole = role.toLowerCase().replace(/\s+/g, '');
        this.router.navigate([WDO_BASE, 'access-manager', appUserId, normalizedRole]);
    }

    navigateToOnboarding(): void {
        this.router.navigate([WDO_BASE, 'onboarding']);
    }
}