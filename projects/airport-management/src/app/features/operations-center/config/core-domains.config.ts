
import { UserRole } from '../models/command-bar.models';
import { GatewayDomainConfig, GatewayDomainId } from '../models/core-domains.models';

const { SUPER_ADMIN, ADMIN, SUPERVISOR, PILOT, ATTENDANT } = UserRole;

// ─────────────────────────────────────────────────────────────────────────────
// Role groups: mirrors of RoleGroups in core/auth/auth.guard.ts.
// If RoleGroups exposes plain role arrays, these can be replaced by direct imports.
// ─────────────────────────────────────────────────────────────────────────────
const OPERATIONS: readonly UserRole[] = [SUPER_ADMIN, ADMIN, SUPERVISOR, PILOT]; // canMatchOperations
const MANAGEMENT: readonly UserRole[] = [SUPER_ADMIN, ADMIN, SUPERVISOR]; //        canMatchManagement
const EXECUTIVE: readonly UserRole[] = [SUPER_ADMIN, ADMIN]; //                     canMatchExecutive

// ─────────────────────────────────────────────────────────────────────────────
// Per-domain roles = the canMatch guard on the domain route in app.routes.ts.
// ─────────────────────────────────────────────────────────────────────────────
const FLIGHT_OPERATIONS_ROLES = OPERATIONS;
const FLEET_ASSETS_ROLES = MANAGEMENT;
const CREW_INTELLIGENCE_ROLES = MANAGEMENT;
const NETWORK_INFRA_ROLES = EXECUTIVE;
const COMMERCIAL_REVENUE_ROLES = EXECUTIVE;


const RESERVATION_GROUND_ROLES = EXECUTIVE;

export function isRoleAllowed(allowedRoles: readonly UserRole[], role: UserRole): boolean {
    return allowedRoles.includes(role);
}

/** Sidebar roles for a module, clipped to what its domain guard permits. */
const within = (domainRoles: readonly UserRole[], moduleRoles: readonly UserRole[]): readonly UserRole[] =>
    moduleRoles.filter(role => domainRoles.includes(role));

// ─────────────────────────────────────────────────────────────────────────────
// Domain base routes (exactly the paths declared under `aoms` in app.routes.ts)
// ─────────────────────────────────────────────────────────────────────────────
const FLIGHT_OPERATIONS = '/aoms/flight-operations';
const FLEET_CONFIGURATION = '/aoms/fleet-configuration';
const WORKFORCE_INTELLIGENCE = '/aoms/workforce-intelligence';
const NETWORK_INFRASTRUCTURE = '/aoms/network-infrastructure';
const COMMERCIAL_REVENUE = '/aoms/commercial-revenue';
const RESERVATION_GROUND = '/aoms/reservation-ground';

/** Sub-link ids match the `id` of the corresponding child in AOMS_NAV_ITEMS (layout.store.ts). */
export const GATEWAY_DOMAINS: readonly GatewayDomainConfig[] = [
    {
        id: GatewayDomainId.FLIGHT_OPERATIONS,
        title: 'Flight Operations',
        description: 'Operation Control Center, dispatch and live surveillance',
        primaryActionLabel: 'Enter Operation Control Center',
        primaryRoute: FLIGHT_OPERATIONS,
        allowedRoles: FLIGHT_OPERATIONS_ROLES,
        restrictionNote: 'Flight operations access is restricted.',
        subLinks: [
            { id: 'network-planning', label: 'Scheduling Network Planning (SNP)', route: `${FLIGHT_OPERATIONS}/network-planning`, allowedRoles: within(FLIGHT_OPERATIONS_ROLES, [SUPER_ADMIN, ADMIN, SUPERVISOR]) },
            { id: 'dispatch-center', label: 'Dynamic Flight Dispatch (DFD)', route: `${FLIGHT_OPERATIONS}/dispatch-center`, allowedRoles: within(FLIGHT_OPERATIONS_ROLES, [SUPER_ADMIN, ADMIN, SUPERVISOR, PILOT]) },
            { id: 'ops-surveillance', label: 'Real-time Ops Surveillance (ROS)', route: `${FLIGHT_OPERATIONS}/ops-surveillance`, allowedRoles: within(FLIGHT_OPERATIONS_ROLES, [SUPER_ADMIN, ADMIN, SUPERVISOR]) },
            { id: 'schedules', label: 'Executive Ops Intelligence (EOI)', route: `${FLIGHT_OPERATIONS}/schedules`, allowedRoles: within(FLIGHT_OPERATIONS_ROLES, MANAGEMENT) }, // this route also carries canMatchManagement
        ],
    },
    {
        id: GatewayDomainId.FLEET_ASSETS,
        title: 'Fleet & Assets',
        description: 'Technical configuration and asset lifecycle',
        primaryActionLabel: 'Open fleet configuration',
        primaryRoute: FLEET_CONFIGURATION,
        allowedRoles: FLEET_ASSETS_ROLES,
        restrictionNote: 'Fleet and asset data are restricted.',
        subLinks: [
            { id: 'aircraft', label: 'Fleet Inventory & Lifecycle (FIL)', route: `${FLEET_CONFIGURATION}/fleet-inventory-lifecycle`, allowedRoles: within(FLEET_ASSETS_ROLES, [SUPER_ADMIN, ADMIN, SUPERVISOR]) },
            { id: 'cabin-configuration', label: 'LOPA & Cabin Configuration Designer', route: `${FLEET_CONFIGURATION}/cabin-configuration-designer`, allowedRoles: within(FLEET_ASSETS_ROLES, [SUPER_ADMIN, ADMIN, SUPERVISOR]) },
            { id: 'aircraft-types', label: 'Aircraft Type Authority (ATA)', route: `${FLEET_CONFIGURATION}/aircraft-type-authority`, allowedRoles: within(FLEET_ASSETS_ROLES, [SUPER_ADMIN, ADMIN]) },
        ],
    },
    {
        id: GatewayDomainId.CREW_INTELLIGENCE,
        title: 'Crew Intelligence',
        description: 'Workforce rostering and legal compliance control',
        primaryActionLabel: 'Open workforce intelligence',
        primaryRoute: WORKFORCE_INTELLIGENCE,
        allowedRoles: CREW_INTELLIGENCE_ROLES,
        restrictionNote: 'Workforce data are restricted.',
        subLinks: [
            { id: 'workforce-directory', label: 'Workforce Directory & HR Operations (WDO)', route: `${WORKFORCE_INTELLIGENCE}/workforce-directory`, allowedRoles: within(CREW_INTELLIGENCE_ROLES, [SUPER_ADMIN, ADMIN, SUPERVISOR]) },
            { id: 'crew-compliance', label: 'Crew Identity & Compliance Intelligence (CIC)', route: `${WORKFORCE_INTELLIGENCE}/crew-compliance`, allowedRoles: within(CREW_INTELLIGENCE_ROLES, [SUPER_ADMIN, ADMIN, SUPERVISOR]) },
            { id: 'tactical-rostering', label: 'Tactical Rostering & Schedule Center (TRC)', route: `${WORKFORCE_INTELLIGENCE}/tactical-rostering`, allowedRoles: within(CREW_INTELLIGENCE_ROLES, [SUPER_ADMIN, ADMIN, SUPERVISOR]) },
            { id: 'workforce-analytics', label: 'Workforce Analytics & Dashboard (WAD)', route: `${WORKFORCE_INTELLIGENCE}/workforce-analytics`, allowedRoles: within(CREW_INTELLIGENCE_ROLES, [SUPER_ADMIN, ADMIN, SUPERVISOR]) },
        ],
    },
    {
        id: GatewayDomainId.NETWORK_INFRA,
        title: 'Network & Infrastructure',
        description: 'Global airport hubs and route network',
        primaryActionLabel: 'Open network management',
        primaryRoute: NETWORK_INFRASTRUCTURE,
        allowedRoles: NETWORK_INFRA_ROLES,
        restrictionNote: 'Network and infrastructure data are restricted.',
        subLinks: [
            { id: 'airports', label: 'Airport Hub Operations', route: `${NETWORK_INFRASTRUCTURE}/airport-hub-operations`, allowedRoles: within(NETWORK_INFRA_ROLES, [SUPER_ADMIN, ADMIN]) },
            { id: 'countries', label: 'Global Geography', route: `${NETWORK_INFRASTRUCTURE}/global-geography`, allowedRoles: within(NETWORK_INFRA_ROLES, [SUPER_ADMIN, ADMIN]) },
            { id: 'routes', label: 'Route Explorer Planning', route: `${NETWORK_INFRASTRUCTURE}/route-network-planner`, allowedRoles: within(NETWORK_INFRA_ROLES, [SUPER_ADMIN, ADMIN]) },
            { id: 'airlines', label: 'Airline & Partnership Directory', route: `${NETWORK_INFRASTRUCTURE}/airline-partnership-directory`, allowedRoles: within(NETWORK_INFRA_ROLES, [SUPER_ADMIN, ADMIN]) },
        ],
    },
    {
        id: GatewayDomainId.COMMERCIAL_REVENUE,
        title: 'Commercial & Revenue',
        description: 'Yield management, fare structures and financial auditing',
        primaryActionLabel: 'Open commercial hub',
        primaryRoute: COMMERCIAL_REVENUE,
        allowedRoles: COMMERCIAL_REVENUE_ROLES,
        restrictionNote: 'Restricted financial access.',
        subLinks: [
            // The sidebar also lists Supervisor on the first two, but the domain guard is Executive-only, so within() drops it.
            { id: 'fare-engine', label: 'Fare Engine & Policy Manager (FEP)', route: `${COMMERCIAL_REVENUE}/fare-engine`, allowedRoles: within(COMMERCIAL_REVENUE_ROLES, [SUPER_ADMIN, ADMIN, SUPERVISOR]) },
            { id: 'dynamic-pricing', label: 'Dynamic Pricing & Logic Rules (DPR)', route: `${COMMERCIAL_REVENUE}/dynamic-pricing`, allowedRoles: within(COMMERCIAL_REVENUE_ROLES, [SUPER_ADMIN, ADMIN, SUPERVISOR]) },
            { id: 'ancillary-catalog', label: 'Ancillary Product Catalog (APC)', route: `${COMMERCIAL_REVENUE}/ancillary-catalog`, allowedRoles: within(COMMERCIAL_REVENUE_ROLES, [SUPER_ADMIN, ADMIN]) },
            { id: 'financial-hub', label: 'Financial Audit & Revenue Hub (FAR)', route: `${COMMERCIAL_REVENUE}/financial-hub`, allowedRoles: within(COMMERCIAL_REVENUE_ROLES, [SUPER_ADMIN, ADMIN]) },
        ],
    },
    {
        id: GatewayDomainId.RESERVATION_GROUND,
        title: 'Reservations & Ground Handling',
        description: 'Booking lifecycle, e-ticketing, boarding and loyalty',
        primaryActionLabel: 'Open reservations & ground',
        primaryRoute: RESERVATION_GROUND,
        allowedRoles: RESERVATION_GROUND_ROLES,
        restrictionNote: 'Passenger and booking data are restricted.',
        subLinks: [
            { id: 'booking-center', label: 'Global PNR & Booking Center', route: `${RESERVATION_GROUND}/booking-center`, allowedRoles: within(RESERVATION_GROUND_ROLES, [SUPER_ADMIN, ADMIN, SUPERVISOR]) },
            { id: 'ticketing-hub', label: 'E-Ticketing & Document Suite', route: `${RESERVATION_GROUND}/ticketing-hub`, allowedRoles: within(RESERVATION_GROUND_ROLES, [SUPER_ADMIN, ADMIN, SUPERVISOR]) },
            { id: 'ground-handling', label: 'Ground Handling & Gate Ops', route: `${RESERVATION_GROUND}/ground-handling`, allowedRoles: within(RESERVATION_GROUND_ROLES, [SUPER_ADMIN, ADMIN, SUPERVISOR, ATTENDANT]) },
            { id: 'loyalty-intelligence', label: 'Loyalty Intelligence', route: `${RESERVATION_GROUND}/loyalty-intelligence`, allowedRoles: within(RESERVATION_GROUND_ROLES, [SUPER_ADMIN, ADMIN]) },
        ],
    },
];