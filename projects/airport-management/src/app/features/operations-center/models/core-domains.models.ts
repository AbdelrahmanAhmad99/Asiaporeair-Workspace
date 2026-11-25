

import { UserRole } from './command-bar.models';
import { KpiStatusTone } from './executive-kpi.models';

// ─────────────────────────────────────────────────────────────────────────────
// Identity
// ─────────────────────────────────────────────────────────────────────────────

export const GatewayDomainId = {
    FLIGHT_OPERATIONS: 'flight-operations-gateway-card',
    FLEET_ASSETS: 'fleet-assets-gateway-card',
    CREW_INTELLIGENCE: 'crew-intelligence-gateway-card',
    NETWORK_INFRA: 'network-infra-gateway-card',
    COMMERCIAL_REVENUE: 'commercial-revenue-gateway-card',
    RESERVATION_GROUND: 'reservation-ground-gateway-card',
} as const;
export type GatewayDomainId = (typeof GatewayDomainId)[keyof typeof GatewayDomainId];

export type LockedPresentation = 'LOCK' | 'HIDE';


export interface GatewaySubLinkConfig {
    readonly id: string;
    readonly label: string;
    readonly route: string;
    readonly allowedRoles: readonly UserRole[];
}

export interface GatewayDomainConfig {
    readonly id: GatewayDomainId;
    readonly title: string;
    readonly description: string;
    readonly primaryActionLabel: string;
    readonly primaryRoute: string;
    readonly allowedRoles: readonly UserRole[];
    readonly restrictionNote: string;
    readonly subLinks: readonly GatewaySubLinkConfig[];
}

// ─────────────────────────────────────────────────────────────────────────────
// View-models
// ─────────────────────────────────────────────────────────────────────────────

export type GatewayAccess = 'GRANTED' | 'LOCKED';

export type MetricTone = 'NEUTRAL' | 'WARN' | 'BAD';

export interface GatewayMetricView {
    readonly label: string;
    readonly value: string;
    readonly tone: MetricTone;
}

export interface GatewayTelemetryView {
    readonly tone: KpiStatusTone;
    readonly statusLabel: string;
    readonly metrics: readonly GatewayMetricView[];
}

export interface GatewaySubLinkView {
    readonly id: string;
    readonly label: string;
    readonly route: string;
    readonly isLocked: boolean;
    readonly lockHint: string | null;
}

export interface GatewayRestrictionView {
    readonly badgeLabel: string;
    readonly note: string;
    readonly clearanceLabel: string;
    readonly requiredRoles: readonly UserRole[];
}

export interface GatewayCardViewModel {
    readonly id: GatewayDomainId;
    readonly title: string;
    readonly description: string;
    readonly primaryActionLabel: string;
    readonly primaryRoute: string;
    readonly access: GatewayAccess;
    readonly telemetry: GatewayTelemetryView | null;
    readonly subLinks: readonly GatewaySubLinkView[];
    readonly restriction: GatewayRestrictionView | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Events
// ─────────────────────────────────────────────────────────────────────────────

export interface GatewayNavigationEvent {
    readonly domainId: GatewayDomainId;
    readonly route: string;
    readonly target: 'PRIMARY' | 'SUB_LINK';
    readonly subLinkId: string | null;
}

export interface GatewayAccessRequestEvent {
    readonly domainId: GatewayDomainId;
    readonly requiredRoles: readonly UserRole[];
}