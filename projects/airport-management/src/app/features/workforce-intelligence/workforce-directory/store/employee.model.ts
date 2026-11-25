
import { UserRole } from '../../../../core/auth/roles.model';

// ── Shared filter/page helpers ────────────────────────────────────────────

export type EmployeeStatus = 'Active' | 'Inactive' | 'OnLeave';

export interface IEmployeeFilterDto {
    role?: string;
    search?: string;       // name or ID substring
    status?: EmployeeStatus | '';
    // date range helpers
    hiredAfter?: string;
    hiredBefore?: string;
}

// ── Summary DTO returned by the paginated list ────────────────────────────

export interface IEmployeeSummaryDto {
    employeeId: number;
    appUserId: string;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    profilePictureUrl?: string;
    userType: UserRole;
    /** Human-readable role display label */
    role: string;
    department?: string;

    // Core Operational Fields
    isActive: boolean;
    baseSalary: number;
    hireDate: string;

    // Legacy/List references (kept for compatibility or mapped)
    salary?: number;
    status?: EmployeeStatus;
    dateOfHire?: string;

    crewBaseAirport?: string;
    crewBaseAirportIata?: string;
    licenseNumber?: string;
    totalFlightHours?: number;
    position?: string;
}

// ── Analytics DTO returned by the dashboard endpoint ─────────────────────

export interface IEmployeeAnalyticsDto {
    totalEmployees: number;
    totalPilots: number;
    totalAttendants: number;
    totalAdmins: number;
    totalSupervisors: number;
    totalSuperAdmins: number;
    activeCount: number;
    inactiveCount: number;
    onLeaveCount: number;
    /** Monthly hire trend — last 6 months */
    hiringTrend?: IHiringTrendPoint[];
}

export interface IHiringTrendPoint {
    month: string;  // "Jan", "Feb" etc.
    count: number;
}

// ── Salary update ─────────────────────────────────────────────────────────

export interface IUpdateSalaryRequestDto {
    newSalary: number;
    effectiveDate?: string;
    reason?: string;
}