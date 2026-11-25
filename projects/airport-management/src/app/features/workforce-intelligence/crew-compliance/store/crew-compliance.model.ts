
// ── Crew Rank Taxonomy ────────────────────────────────────────────────────
export type CrewRank =
    | 'Captain'
    | 'FirstOfficer'
    | 'LeadPurser'
    | 'SeniorPurser'
    | 'FlightSteward'
    | '';

// ── Compliance Status Levels ──────────────────────────────────────────────
/** Mirrors the three visual states in the neon-glow status badge. */
export type ComplianceStatus = 'Compliant' | 'Warning' | 'NonCompliant' | '';

// ── Active Filter Shape ────────────────────────────────────────────────────
export interface ICrewComplianceFilters {
    /** IATA airport code — e.g. "SIN", "KUL", "NRT". Case-insensitive. */
    base: string;
    rank: CrewRank;
    complianceStatus: ComplianceStatus;
    search: string;
}

// ── Pagination Shape ──────────────────────────────────────────────────────
export interface ICrewCompliancePagination {
    total: number;
    page: number;
    size: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

// ── UI-Ready Crew Member (enriched from backend DTO) ──────────────────────
export interface ICrewComplianceMember {
    employeeId: number;
    appUserId: string;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    rank: string;
    position: string;
    baseAirportIata: string;
    isActive: boolean;
    overallComplianceStatus: ComplianceStatus;
}

// ── Rank Display Labels ────────────────────────────────────────────────────
export const RANK_OPTIONS: { value: CrewRank; label: string }[] = [
    { value: '', label: 'All Ranks' },
    { value: 'Captain', label: 'Captain' },
    { value: 'FirstOfficer', label: 'First Officer' },
    { value: 'LeadPurser', label: 'Lead Purser' },
    { value: 'SeniorPurser', label: 'Senior Purser' },
    { value: 'FlightSteward', label: 'Flight Steward' },
];

// ── Status Options ─────────────────────────────────────────────────────────
export const STATUS_OPTIONS: { value: ComplianceStatus; label: string }[] = [
    { value: '', label: 'All Statuses' },
    { value: 'Compliant', label: 'Compliant' },
    { value: 'Warning', label: 'Warning' },
    { value: 'NonCompliant', label: 'Non-Compliant' },
];
