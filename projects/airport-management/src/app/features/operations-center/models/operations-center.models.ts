

import type { Observable } from 'rxjs';

export type EpochMillis = number;

// ─────────────────────────────────────────────────────────────────────────────
// 1. Enumerations
// ─────────────────────────────────────────────────────────────────────────────

export const ServiceStatus = {
    OPERATIONAL: 'OPERATIONAL',
    DEGRADED: 'DEGRADED',
    DOWN: 'DOWN',
} as const;
export type ServiceStatus = (typeof ServiceStatus)[keyof typeof ServiceStatus];

export const OperationalDomain = {
    NETWORK: 'NETWORK',
    FLEET: 'FLEET',
    WORKFORCE: 'WORKFORCE',
    PLANNING: 'PLANNING',
    COMMERCIAL: 'COMMERCIAL',
    RESERVATION: 'RESERVATION',
} as const;
export type OperationalDomain = (typeof OperationalDomain)[keyof typeof OperationalDomain];

export const AlertSeverity = {
    CRITICAL: 'CRITICAL',
    WARNING: 'WARNING',
    INFO: 'INFO',
} as const;
export type AlertSeverity = (typeof AlertSeverity)[keyof typeof AlertSeverity];

export const AlertCategory = {
    AOG: 'AOG',
    DELAY: 'DELAY',
    CREW_EXPIRY: 'CREW_EXPIRY',
    EMERGENCY: 'EMERGENCY',
} as const;
export type AlertCategory = (typeof AlertCategory)[keyof typeof AlertCategory];

export const AlertStatus = {
    ACTIVE: 'ACTIVE',
    ACKNOWLEDGED: 'ACKNOWLEDGED',
} as const;
export type AlertStatus = (typeof AlertStatus)[keyof typeof AlertStatus];

export const AlertEntityType = {
    AIRCRAFT: 'AIRCRAFT',
    FLIGHT: 'FLIGHT',
    CREW_MEMBER: 'CREW_MEMBER',
    AIRPORT: 'AIRPORT',
} as const;
export type AlertEntityType = (typeof AlertEntityType)[keyof typeof AlertEntityType];

export const TrendDirection = {
    UP: 'UP',
    DOWN: 'DOWN',
    FLAT: 'FLAT',
} as const;
export type TrendDirection = (typeof TrendDirection)[keyof typeof TrendDirection];

export const ConnectionPhase = {
    CONNECTING: 'CONNECTING',
    LIVE: 'LIVE',
    RECONNECTING: 'RECONNECTING',
    POLLING: 'POLLING',
    OFFLINE: 'OFFLINE',
} as const;
export type ConnectionPhase = (typeof ConnectionPhase)[keyof typeof ConnectionPhase];

export const SearchTargetKind = {
    PNR: 'PNR',
    FLIGHT_NUMBER: 'FLIGHT_NUMBER',
    TAIL_NUMBER: 'TAIL_NUMBER',
    CREW_ID: 'CREW_ID',
    UNKNOWN: 'UNKNOWN',
} as const;
export type SearchTargetKind = (typeof SearchTargetKind)[keyof typeof SearchTargetKind];

export const SearchOutcome = {
    NAVIGATE: 'NAVIGATE',
    PREVIEW: 'PREVIEW',
    NO_MATCH: 'NO_MATCH',
} as const;
export type SearchOutcome = (typeof SearchOutcome)[keyof typeof SearchOutcome];

// ─────────────────────────────────────────────────────────────────────────────
// 2. GlobalSystemHealth
// ─────────────────────────────────────────────────────────────────────────────

export interface ServiceHealth {
    readonly status: ServiceStatus;
    readonly latencyMs: number | null;
    readonly checkedAt: EpochMillis;
}

export interface GlobalSystemHealth {
    readonly apiGateway: ServiceHealth;
    readonly webSocketStream: ServiceHealth;
    readonly database: ServiceHealth;
    readonly occServer: ServiceHealth;
    readonly domainGateways: Readonly<Record<OperationalDomain, ServiceHealth>>;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. ExecutiveKPIs
// ─────────────────────────────────────────────────────────────────────────────

export interface ActiveFlightsKpi {
    readonly total: number;
    readonly delta: number;
    readonly forecastTotal: number;
}

export interface OtpRateKpi {
    readonly percentage: number;
    readonly trend: TrendDirection;
    readonly trendDeltaPct: number;
    readonly forecastPercentage: number;
    readonly averageDelayMinutes: number;
    readonly delayVarianceMinutes: number;
}

export interface FleetAvailabilityKpi {
    readonly readinessRatio: number;
    readonly availableAircraft: number;
    readonly totalAircraft: number;
    readonly inMaintenanceCount: number;
    readonly aogCount: number;
    readonly forecastReadinessRatio: number;
}

export interface CrewReadinessKpi {
    readonly rosteredToday: number;
    readonly onDutyNow: number;
    readonly standbyAvailable: number;
    readonly expiringCertifications: number;
    readonly dutyCompliancePct: number;
    readonly forecastDutyCompliancePct: number;
}

export interface NetworkKpi {
    readonly activeAirports: number;
    readonly operationalRoutes: number;
    readonly restrictedAirports: number;
    readonly hubsOperational: number;
    readonly hubsTotal: number;
    readonly forecastOperationalRoutes: number;
}

export interface RevenueKpi {
    readonly dailyRevenue: number;
    readonly currency: string;
    readonly deltaPct: number;
    readonly forecastRevenue: number;
    readonly yieldPerRpk: number;
    readonly forecastYieldPerRpk: number;
    readonly activePricingRules: number;
}

export interface ReservationKpi {
    readonly bookingsToday: number;
    readonly checkInRatePct: number;
    readonly activeGates: number;
    readonly totalGates: number;
}

export interface ExecutiveKPIs {
    readonly activeFlights: ActiveFlightsKpi;
    readonly otpRate: OtpRateKpi;
    readonly fleetAvailability: FleetAvailabilityKpi;
    readonly crew: CrewReadinessKpi;
    readonly network: NetworkKpi;
    readonly revenue: RevenueKpi;
    readonly reservations: ReservationKpi;
    readonly generatedAt: EpochMillis;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. OperationalAlert
// ─────────────────────────────────────────────────────────────────────────────

export interface OperationalAlert {
    readonly id: string;
    readonly severity: AlertSeverity;
    readonly category: AlertCategory;
    readonly timestamp: EpochMillis;
    readonly message: string;
    readonly entityId: string;
    readonly entityType: AlertEntityType;
    readonly status: AlertStatus;
    readonly acknowledgedAt: EpochMillis | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. AirborneFlightMarker
// ─────────────────────────────────────────────────────────────────────────────

export interface AirborneFlightMarker {
    readonly flightNumber: string;
    readonly tailNumber: string;
    readonly latitude: number;
    readonly longitude: number;
    readonly altitudeFt: number;
    readonly groundSpeedKts: number;
    readonly headingDeg: number;
    readonly origin: string;
    readonly destination: string;
    readonly updatedAt: EpochMillis;
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Transport contract (snapshot + push events)
// ─────────────────────────────────────────────────────────────────────────────

export interface OperationsSnapshot {
    readonly systemHealth: GlobalSystemHealth;
    readonly kpis: ExecutiveKPIs;
    readonly alerts: readonly OperationalAlert[];
    readonly airborneFleet: readonly AirborneFlightMarker[];
    readonly generatedAt: EpochMillis;
}

export interface HealthUpdateEvent {
    readonly type: 'HEALTH_UPDATE';
    readonly health: GlobalSystemHealth;
}
export interface KpiUpdateEvent {
    readonly type: 'KPI_UPDATE';
    readonly kpis: ExecutiveKPIs;
}
export interface AlertRaisedEvent {
    readonly type: 'ALERT_RAISED';
    readonly alert: OperationalAlert;
}
export interface AlertResolvedEvent {
    readonly type: 'ALERT_RESOLVED';
    readonly alertId: string;
}
export interface FleetUpsertEvent {
    readonly type: 'FLEET_UPSERT';
    readonly markers: readonly AirborneFlightMarker[];
}
export interface FleetRemoveEvent {
    readonly type: 'FLEET_REMOVE';
    readonly flightNumbers: readonly string[];
}
export interface HeartbeatEvent {
    readonly type: 'HEARTBEAT';
}

export type OperationsFeedEvent =
    | HealthUpdateEvent
    | KpiUpdateEvent
    | AlertRaisedEvent
    | AlertResolvedEvent
    | FleetUpsertEvent
    | FleetRemoveEvent
    | HeartbeatEvent;


export interface OperationsFeedGateway {
    loadSnapshot(): Observable<OperationsSnapshot>;
    connect(): Observable<OperationsFeedEvent>;
    acknowledgeAlert(alertId: string): Observable<void>;
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. Connection recovery & global search view-models
// ─────────────────────────────────────────────────────────────────────────────

export interface ConnectionStatus {
    readonly phase: ConnectionPhase;
    readonly attempt: number;
    readonly nextRetryAt: EpochMillis | null;
    readonly lastError: string | null;
}

export type RecoveryTone = 'NONE' | 'RECOVERING' | 'DEGRADED' | 'OFFLINE';

export interface ConnectionRecoveryIndicator {
    readonly visible: boolean;
    readonly tone: RecoveryTone;
    readonly headline: string;
    readonly detail: string;
    readonly attempt: number;
    readonly maxAttempts: number;
    readonly nextRetryAt: EpochMillis | null;
}

export interface GlobalSearchResolution {
    readonly query: string;
    readonly kind: SearchTargetKind;
    readonly outcome: SearchOutcome;
    readonly commands: readonly string[] | null;
    readonly preview: AirborneFlightMarker | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. Store state
// ─────────────────────────────────────────────────────────────────────────────

export interface OperationsCenterState {
    readonly systemHealth: GlobalSystemHealth;
    readonly kpiMetrics: ExecutiveKPIs;
    readonly alerts: readonly OperationalAlert[];
    readonly fleet: ReadonlyMap<string, AirborneFlightMarker>;
    readonly searchQuery: string;
    readonly searchResolution: GlobalSearchResolution | null;
    readonly isLoading: boolean;
    readonly connection: ConnectionStatus;
    readonly lastSyncedAt: EpochMillis | null;
    readonly actionError: string | null;
}