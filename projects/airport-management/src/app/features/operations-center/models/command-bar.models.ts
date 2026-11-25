
import { SearchTargetKind, ServiceStatus } from './operations-center.models';


export const UserRole = {
    SUPER_ADMIN: 'SuperAdmin',
    ADMIN: 'Admin',
    SUPERVISOR: 'Supervisor',
    PILOT: 'Pilot',
    ATTENDANT: 'Attendant',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export type RoleEmphasis = 'PRIMARY' | 'STANDARD';

export interface RoleBadgeConfig {
    readonly label: string;
    readonly emphasis: RoleEmphasis;
}

export const ROLE_BADGE_CONFIG: Readonly<Record<UserRole, RoleBadgeConfig>> = {
    [UserRole.SUPER_ADMIN]: { label: 'SuperAdmin', emphasis: 'PRIMARY' },
    [UserRole.ADMIN]: { label: 'Admin', emphasis: 'STANDARD' },
    [UserRole.SUPERVISOR]: { label: 'Supervisor', emphasis: 'STANDARD' },
    [UserRole.PILOT]: { label: 'Pilot', emphasis: 'STANDARD' },
    [UserRole.ATTENDANT]: { label: 'Attendant', emphasis: 'STANDARD' },
};

export interface OperatorProfile {
    readonly employeeId: string;
    readonly fullName: string;
    readonly role: UserRole;
    /** `null` renders the initials placeholder. */
    readonly avatarUrl: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Clock
// ─────────────────────────────────────────────────────────────────────────────

export interface HubTimeZone {
    readonly code: string;
    readonly name: string;
    readonly ianaTimeZone: string;
}

export const DEFAULT_HUB_TIME_ZONE: HubTimeZone = {
    code: 'SIN',
    name: 'Singapore',
    ianaTimeZone: 'Asia/Singapore',
};

// ─────────────────────────────────────────────────────────────────────────────
// Global quick search
// ─────────────────────────────────────────────────────────────────────────────

export type RoutableSearchKind = Exclude<SearchTargetKind, 'UNKNOWN'>;

export interface SearchDestination {
    /** Base route; the normalised identifier is appended as a path segment. */
    readonly path: string;
    /** Module name shown in the UI. */
    readonly label: string;
    /** Singular noun for the entity, e.g. "Flight". */
    readonly entityLabel: string;
    /** Example identifier used in format hints. */
    readonly example: string;
}

/** Single source of truth for where each identifier type routes. Shared with OperationsCenterStore. */
export const SEARCH_DESTINATIONS: Readonly<Record<RoutableSearchKind, SearchDestination>> = {
    [SearchTargetKind.FLIGHT_NUMBER]: {
        path: '/aoms/flight-operations/dispatch-center',
        label: 'Dynamic Flight Dispatch',
        entityLabel: 'Flight',
        example: 'AP321',
    },
    [SearchTargetKind.TAIL_NUMBER]: {
        path: '/aoms/fleet-configuration/fleet-inventory-lifecycle',
        label: 'Fleet Inventory & Lifecycle',
        entityLabel: 'Aircraft',
        example: '9V-SMI',
    },
    [SearchTargetKind.PNR]: {
        path: '/aoms/reservation-ground/booking-center',
        label: 'Global PNR & Booking Center',
        entityLabel: 'Booking',
        example: '6X9KLP',
    },
    [SearchTargetKind.CREW_ID]: {
        path: '/aoms/workforce-intelligence/workforce-directory',
        label: 'Workforce Directory',
        entityLabel: 'Crew member',
        example: 'CRW-8841',
    },
};

export interface SearchSuggestion {
    readonly id: string;
    readonly kind: RoutableSearchKind;
    readonly value: string;
    readonly title: string;
    readonly destinationLabel: string;
    readonly detail: string;
    readonly isLive: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// System health diagnostics
// ─────────────────────────────────────────────────────────────────────────────

export type HealthTone = 'OPTIMAL' | 'DEGRADED' | 'CRITICAL';

export interface HealthDiagnosticRow {
    readonly id: string;
    readonly label: string;
    readonly status: ServiceStatus;
    readonly reading: string;
}

export interface HealthDiagnostic {
    readonly tone: HealthTone;
    readonly label: string;
    readonly apiLatencyMs: number | null;
    readonly rows: readonly HealthDiagnosticRow[];
}