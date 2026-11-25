
import { TrendDirection } from './operations-center.models';

export const KpiCardId = {
    ACTIVE_FLIGHTS: 'active-flights-kpi',
    OTP_RATE: 'otp-rate-kpi',
    FLEET_AVAILABILITY: 'fleet-availability-kpi',
    CREW_READINESS: 'crew-readiness-kpi',
    NETWORK_HUBS: 'network-hubs-kpi',
    DAILY_REVENUE: 'daily-revenue-kpi',
} as const;
export type KpiCardId = (typeof KpiCardId)[keyof typeof KpiCardId];

export interface KpiCardMeta {
    readonly title: string;
    readonly route: string;
    readonly domainLabel: string;
}

export const KPI_CARD_META: Readonly<Record<KpiCardId, KpiCardMeta>> = {
    [KpiCardId.ACTIVE_FLIGHTS]: {
        title: 'Active flights',
        route: '/aoms/flight-operations',
        domainLabel: 'Flight Operations',
    },
    [KpiCardId.OTP_RATE]: {
        title: 'On-time performance',
        route: '/aoms/flight-operations/schedules',
        domainLabel: 'Executive Ops Intelligence',
    },
    [KpiCardId.FLEET_AVAILABILITY]: {
        title: 'Fleet availability',
        route: '/aoms/fleet-configuration',
        domainLabel: 'Fleet & Assets',
    },
    [KpiCardId.CREW_READINESS]: {
        title: 'Crew readiness',
        route: '/aoms/workforce-intelligence',
        domainLabel: 'Crew Intelligence',
    },
    [KpiCardId.NETWORK_HUBS]: {
        title: 'Network hubs',
        route: '/aoms/network-infrastructure',
        domainLabel: 'Network & Infrastructure',
    },
    [KpiCardId.DAILY_REVENUE]: {
        title: 'Daily revenue',
        route: '/aoms/commercial-revenue',
        domainLabel: 'Commercial & Revenue',
    },
};

/** PENDING = no telemetry yet (or connecting). */
export type KpiStatusTone = 'NOMINAL' | 'WATCH' | 'CRITICAL' | 'PENDING';

export interface KpiStatus {
    readonly tone: KpiStatusTone;
    readonly label: string;
}

/** Whether a movement is good, bad or neither for the airline (an AOG increase is adverse; a flight-count rise is neutral). */
export type TrendSentiment = 'FAVOURABLE' | 'ADVERSE' | 'NEUTRAL';

export interface KpiTrendView {
    readonly direction: TrendDirection;
    readonly sentiment: TrendSentiment;
    readonly label: string;
    readonly caption: string;
}

export interface KpiFact {
    readonly label: string;
    readonly value: string;
    readonly sentiment: TrendSentiment;
}

export interface KpiMeterVisual {
    readonly kind: 'METER';
    readonly fraction: number;
    readonly markerFraction: number | null;
    readonly caption: string;
}

export type KpiSegmentKind = 'OK' | 'WARN' | 'DANGER' | 'REST';

export interface KpiSegment {
    readonly id: string;
    readonly label: string;
    readonly value: string;
    readonly kind: KpiSegmentKind;
    readonly fraction: number;
}

export interface KpiSegmentsVisual {
    readonly kind: 'SEGMENTS';
    readonly segments: readonly KpiSegment[];
}

export interface KpiNoVisual {
    readonly kind: 'NONE';
}

export type KpiVisual = KpiMeterVisual | KpiSegmentsVisual | KpiNoVisual;

export interface KpiCardViewModel {
    readonly id: KpiCardId;
    readonly title: string;
    readonly value: string;
    readonly unit: string;
    readonly status: KpiStatus;
    readonly trend: KpiTrendView | null;
    readonly facts: readonly KpiFact[];
    readonly visual: KpiVisual;
    readonly route: string;
    readonly domainLabel: string;
    readonly ariaLabel: string;
}