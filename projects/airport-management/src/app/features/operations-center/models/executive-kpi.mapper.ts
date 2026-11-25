
import {
    KPI_CARD_META,
    KpiCardId,
    KpiCardViewModel,
    KpiFact,
    KpiSegment,
    KpiStatus,
    KpiStatusTone,
    KpiTrendView,
    TrendSentiment,
} from './executive-kpi.models';
import {
    ActiveFlightsKpi,
    ConnectionPhase,
    ConnectionStatus,
    CrewReadinessKpi,
    FleetAvailabilityKpi,
    NetworkKpi,
    OtpRateKpi,
    RevenueKpi,
    TrendDirection,
} from './operations-center.models';

// ─────────────────────────────────────────────────────────────────────────────
// Status thresholds
// ASSUMED operating limits. Confirm with Operations, then adjust here; nothing else changes.
// ─────────────────────────────────────────────────────────────────────────────
export const KPI_THRESHOLDS = {
    otp: { watchBelowPct: 85, criticalBelowPct: 75 },
    fleet: { watchBelowRatio: 0.9, criticalBelowRatio: 0.8, criticalAogCount: 3 },
    crew: { watchBelowPct: 98, criticalBelowPct: 95 },
    network: { criticalBelowHubRatio: 0.75 },
    revenue: { watchBelowForecastPct: -2, criticalBelowForecastPct: -8 },
} as const;

export interface KpiBuildContext {
    readonly hasData: boolean;
    readonly connection: ConnectionStatus;
    readonly isStale: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Formatting
// ─────────────────────────────────────────────────────────────────────────────
const EM_DASH = '\u2014';
const MINUS = '\u2212';

const integerFormat = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const oneDecimalFormat = new Intl.NumberFormat('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const compactFormat = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 });
const yieldFormat = new Intl.NumberFormat('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 });

const currencyFormats = new Map<string, Intl.NumberFormat | null>();

function formatCompactCurrency(amount: number, currency: string): string {
    let format = currencyFormats.get(currency);
    if (format === undefined) {
        try {
            format = new Intl.NumberFormat('en-US', { style: 'currency', currency, notation: 'compact', maximumFractionDigits: 2 });
        } catch {
            format = null;
        }
        currencyFormats.set(currency, format);
    }
    return format !== null ? format.format(amount) : `${currency} ${compactFormat.format(amount)}`;
}

const clamp01 = (n: number): number => (Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0);

function signed(value: number, format: Intl.NumberFormat, suffix: string): string {
    const abs = format.format(Math.abs(value));
    if (value > 0) return `+${abs}${suffix}`;
    if (value < 0) return `${MINUS}${abs}${suffix}`;
    return `${abs}${suffix}`;
}

type TrendPolarity = 'HIGHER_IS_BETTER' | 'LOWER_IS_BETTER' | 'NEUTRAL';

function sentimentOf(variance: number, polarity: TrendPolarity): TrendSentiment {
    if (variance === 0 || polarity === 'NEUTRAL') return 'NEUTRAL';
    return variance > 0 === (polarity === 'HIGHER_IS_BETTER') ? 'FAVOURABLE' : 'ADVERSE';
}

function buildTrend(
    variance: number,
    epsilon: number,
    format: Intl.NumberFormat,
    suffix: string,
    polarity: TrendPolarity,
    caption: string,
): KpiTrendView {
    const flat = Math.abs(variance) < epsilon;
    const effective = flat ? 0 : variance;
    return {
        direction: effective > 0 ? TrendDirection.UP : effective < 0 ? TrendDirection.DOWN : TrendDirection.FLAT,
        sentiment: sentimentOf(effective, polarity),
        label: signed(effective, format, suffix),
        caption,
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared card plumbing
// ─────────────────────────────────────────────────────────────────────────────
const STATUS_LABEL: Readonly<Record<KpiStatusTone, string>> = {
    NOMINAL: 'Nominal',
    WATCH: 'Watch',
    CRITICAL: 'Critical',
    PENDING: 'Awaiting data',
};

const status = (tone: KpiStatusTone, label: string = STATUS_LABEL[tone]): KpiStatus => ({ tone, label });

const TONE_RANK: Readonly<Record<KpiStatusTone, number>> = { PENDING: 0, NOMINAL: 0, WATCH: 1, CRITICAL: 2 };
const worstTone = (...tones: readonly KpiStatusTone[]): KpiStatusTone =>
    tones.reduce<KpiStatusTone>((w, t) => (TONE_RANK[t] > TONE_RANK[w] ? t : w), 'NOMINAL');

const fact = (label: string, value: string, sentiment: TrendSentiment = 'NEUTRAL'): KpiFact => ({
    label,
    value,
    sentiment,
});

function withAria(card: Omit<KpiCardViewModel, 'ariaLabel'>): KpiCardViewModel {
    const reading = card.unit ? `${card.value} ${card.unit}` : card.value;
    const trend = card.trend ? ` ${card.trend.label} ${card.trend.caption}.` : '';
    return {
        ...card,
        ariaLabel: `${card.title}: ${reading}.${trend} Status: ${card.status.label}. Open ${card.domainLabel}.`,
    };
}

function pendingCard(id: KpiCardId): KpiCardViewModel {
    const meta = KPI_CARD_META[id];
    return withAria({
        id,
        title: meta.title,
        value: EM_DASH,
        unit: '',
        status: status('PENDING'),
        trend: null,
        facts: [],
        visual: { kind: 'NONE' },
        route: meta.route,
        domainLabel: meta.domainLabel,
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Active flights
// ─────────────────────────────────────────────────────────────────────────────
function streamStatus(ctx: KpiBuildContext): KpiStatus {
    switch (ctx.connection.phase) {
        case ConnectionPhase.LIVE:
            return ctx.isStale ? status('WATCH', 'Stream delayed') : status('NOMINAL', 'Live stream');
        case ConnectionPhase.CONNECTING:
            return status('PENDING', 'Connecting');
        case ConnectionPhase.RECONNECTING:
            return status('WATCH', 'Reconnecting');
        case ConnectionPhase.POLLING:
            return status('WATCH', 'Polling');
        case ConnectionPhase.OFFLINE:
        default:
            return status('CRITICAL', 'Offline');
    }
}

export function buildActiveFlightsCard(kpi: ActiveFlightsKpi, ctx: KpiBuildContext): KpiCardViewModel {
    const meta = KPI_CARD_META[KpiCardId.ACTIVE_FLIGHTS];
    const liveStatus = streamStatus(ctx);

    if (!ctx.hasData) {
        // Even before data arrives, the stream state (e.g. Offline) is worth showing.
        const { ariaLabel: _ignored, ...base } = pendingCard(KpiCardId.ACTIVE_FLIGHTS);
        void _ignored;
        return withAria({ ...base, status: liveStatus });
    }

    const scale = Math.max(kpi.total, kpi.forecastTotal, 1);
    return withAria({
        id: KpiCardId.ACTIVE_FLIGHTS,
        title: meta.title,
        value: integerFormat.format(kpi.total),
        unit: 'airborne',
        status: liveStatus,
        trend: buildTrend(kpi.total - kpi.forecastTotal, 1, integerFormat, '', 'NEUTRAL', 'vs forecast'),
        facts: [
            fact('Forecast', integerFormat.format(kpi.forecastTotal)),
            fact('Since last sample', signed(kpi.delta, integerFormat, '')),
        ],
        visual: {
            kind: 'METER',
            fraction: clamp01(kpi.total / scale),
            markerFraction: clamp01(kpi.forecastTotal / scale),
            caption: 'Airborne against forecast',
        },
        route: meta.route,
        domainLabel: meta.domainLabel,
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. On-time performance
// ─────────────────────────────────────────────────────────────────────────────
export function buildOtpCard(kpi: OtpRateKpi, ctx: KpiBuildContext): KpiCardViewModel {
    if (!ctx.hasData) return pendingCard(KpiCardId.OTP_RATE);
    const meta = KPI_CARD_META[KpiCardId.OTP_RATE];
    const t = KPI_THRESHOLDS.otp;

    const tone: KpiStatusTone =
        kpi.percentage < t.criticalBelowPct ? 'CRITICAL' : kpi.percentage < t.watchBelowPct ? 'WATCH' : 'NOMINAL';

    return withAria({
        id: KpiCardId.OTP_RATE,
        title: meta.title,
        value: `${oneDecimalFormat.format(kpi.percentage)}%`,
        unit: 'on time',
        status: status(tone),
        trend: buildTrend(kpi.percentage - kpi.forecastPercentage, 0.05, oneDecimalFormat, ' pp', 'HIGHER_IS_BETTER', 'vs forecast'),
        facts: [
            fact('Average delay', `${integerFormat.format(kpi.averageDelayMinutes)} min`),
            fact(
                'Delay vs forecast',
                signed(kpi.delayVarianceMinutes, integerFormat, ' min'),
                sentimentOf(kpi.delayVarianceMinutes, 'LOWER_IS_BETTER'),
            ),
        ],
        visual: {
            kind: 'METER',
            fraction: clamp01(kpi.percentage / 100),
            markerFraction: clamp01(kpi.forecastPercentage / 100),
            caption: `Forecast ${oneDecimalFormat.format(kpi.forecastPercentage)}%`,
        },
        route: meta.route,
        domainLabel: meta.domainLabel,
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Fleet availability
// ─────────────────────────────────────────────────────────────────────────────
export function buildFleetCard(kpi: FleetAvailabilityKpi, ctx: KpiBuildContext): KpiCardViewModel {
    if (!ctx.hasData) return pendingCard(KpiCardId.FLEET_AVAILABILITY);
    const meta = KPI_CARD_META[KpiCardId.FLEET_AVAILABILITY];
    const t = KPI_THRESHOLDS.fleet;

    const readinessTone: KpiStatusTone =
        kpi.readinessRatio < t.criticalBelowRatio ? 'CRITICAL' : kpi.readinessRatio < t.watchBelowRatio ? 'WATCH' : 'NOMINAL';
    const aogTone: KpiStatusTone = kpi.aogCount >= t.criticalAogCount ? 'CRITICAL' : kpi.aogCount > 0 ? 'WATCH' : 'NOMINAL';

    const whole = Math.max(kpi.totalAircraft, 1);
    const accounted = kpi.availableAircraft + kpi.inMaintenanceCount + kpi.aogCount;
    const remainder = kpi.totalAircraft - accounted;

    const segments: KpiSegment[] = [
        { id: 'operational', label: 'Operational', value: integerFormat.format(kpi.availableAircraft), kind: 'OK', fraction: clamp01(kpi.availableAircraft / whole) },
        { id: 'maintenance', label: 'Maintenance', value: integerFormat.format(kpi.inMaintenanceCount), kind: 'WARN', fraction: clamp01(kpi.inMaintenanceCount / whole) },
        { id: 'aog', label: 'AOG', value: integerFormat.format(kpi.aogCount), kind: 'DANGER', fraction: clamp01(kpi.aogCount / whole) },
    ];
    if (remainder >= 1) {
        segments.push({ id: 'other', label: 'Other', value: integerFormat.format(remainder), kind: 'REST', fraction: clamp01(remainder / whole) });
    }

    return withAria({
        id: KpiCardId.FLEET_AVAILABILITY,
        title: meta.title,
        value: integerFormat.format(kpi.availableAircraft),
        unit: `of ${integerFormat.format(kpi.totalAircraft)} aircraft`,
        status: status(worstTone(readinessTone, aogTone)),
        trend: buildTrend(
            (kpi.readinessRatio - kpi.forecastReadinessRatio) * 100,
            0.05,
            oneDecimalFormat,
            ' pp',
            'HIGHER_IS_BETTER',
            'readiness vs forecast',
        ),
        facts: [
            fact('Readiness', `${oneDecimalFormat.format(kpi.readinessRatio * 100)}%`),
            fact('Forecast', `${oneDecimalFormat.format(kpi.forecastReadinessRatio * 100)}%`),
        ],
        visual: { kind: 'SEGMENTS', segments },
        route: meta.route,
        domainLabel: meta.domainLabel,
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Crew readiness
// ─────────────────────────────────────────────────────────────────────────────
export function buildCrewCard(kpi: CrewReadinessKpi, ctx: KpiBuildContext): KpiCardViewModel {
    if (!ctx.hasData) return pendingCard(KpiCardId.CREW_READINESS);
    const meta = KPI_CARD_META[KpiCardId.CREW_READINESS];
    const t = KPI_THRESHOLDS.crew;

    const tone: KpiStatusTone =
        kpi.dutyCompliancePct < t.criticalBelowPct ? 'CRITICAL' : kpi.dutyCompliancePct < t.watchBelowPct ? 'WATCH' : 'NOMINAL';

    return withAria({
        id: KpiCardId.CREW_READINESS,
        title: meta.title,
        value: integerFormat.format(kpi.onDutyNow),
        unit: 'on duty',
        status: status(tone),
        trend: buildTrend(
            kpi.dutyCompliancePct - kpi.forecastDutyCompliancePct,
            0.05,
            oneDecimalFormat,
            ' pp',
            'HIGHER_IS_BETTER',
            'compliance vs forecast',
        ),
        facts: [
            fact('Standby available', integerFormat.format(kpi.standbyAvailable)),
            fact('Certificates expiring', integerFormat.format(kpi.expiringCertifications), kpi.expiringCertifications > 0 ? 'ADVERSE' : 'NEUTRAL'),
        ],
        visual: {
            kind: 'METER',
            fraction: clamp01(kpi.dutyCompliancePct / 100),
            markerFraction: clamp01(kpi.forecastDutyCompliancePct / 100),
            caption: `Duty-period compliance ${oneDecimalFormat.format(kpi.dutyCompliancePct)}%`,
        },
        route: meta.route,
        domainLabel: meta.domainLabel,
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Network hubs
// ─────────────────────────────────────────────────────────────────────────────
export function buildNetworkCard(kpi: NetworkKpi, ctx: KpiBuildContext): KpiCardViewModel {
    if (!ctx.hasData) return pendingCard(KpiCardId.NETWORK_HUBS);
    const meta = KPI_CARD_META[KpiCardId.NETWORK_HUBS];
    const t = KPI_THRESHOLDS.network;

    const hubRatio = kpi.hubsTotal > 0 ? kpi.hubsOperational / kpi.hubsTotal : 0;
    const tone: KpiStatusTone =
        hubRatio < t.criticalBelowHubRatio
            ? 'CRITICAL'
            : kpi.hubsOperational < kpi.hubsTotal || kpi.restrictedAirports > 0
                ? 'WATCH'
                : 'NOMINAL';

    return withAria({
        id: KpiCardId.NETWORK_HUBS,
        title: meta.title,
        value: integerFormat.format(kpi.hubsOperational),
        unit: `of ${integerFormat.format(kpi.hubsTotal)} hubs`,
        status: status(tone),
        trend: buildTrend(
            kpi.operationalRoutes - kpi.forecastOperationalRoutes,
            1,
            integerFormat,
            '',
            'HIGHER_IS_BETTER',
            'routes vs forecast',
        ),
        facts: [
            fact('Route segments', integerFormat.format(kpi.operationalRoutes)),
            fact('Restricted airports', integerFormat.format(kpi.restrictedAirports), kpi.restrictedAirports > 0 ? 'ADVERSE' : 'NEUTRAL'),
        ],
        visual: { kind: 'METER', fraction: clamp01(hubRatio), markerFraction: null, caption: 'Hubs operational' },
        route: meta.route,
        domainLabel: meta.domainLabel,
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Daily revenue
// ─────────────────────────────────────────────────────────────────────────────
export function buildRevenueCard(kpi: RevenueKpi, ctx: KpiBuildContext): KpiCardViewModel {
    if (!ctx.hasData) return pendingCard(KpiCardId.DAILY_REVENUE);
    const meta = KPI_CARD_META[KpiCardId.DAILY_REVENUE];
    const t = KPI_THRESHOLDS.revenue;

    const hasForecast = kpi.forecastRevenue > 0;
    const variancePct = hasForecast ? ((kpi.dailyRevenue - kpi.forecastRevenue) / kpi.forecastRevenue) * 100 : 0;
    const tone: KpiStatusTone = !hasForecast
        ? 'NOMINAL'
        : variancePct < t.criticalBelowForecastPct
            ? 'CRITICAL'
            : variancePct < t.watchBelowForecastPct
                ? 'WATCH'
                : 'NOMINAL';

    const yieldSentiment: TrendSentiment =
        kpi.forecastYieldPerRpk > 0 ? sentimentOf(kpi.yieldPerRpk - kpi.forecastYieldPerRpk, 'HIGHER_IS_BETTER') : 'NEUTRAL';

    return withAria({
        id: KpiCardId.DAILY_REVENUE,
        title: meta.title,
        value: formatCompactCurrency(kpi.dailyRevenue, kpi.currency),
        unit: 'today',
        status: status(tone),
        trend: hasForecast ? buildTrend(variancePct, 0.05, oneDecimalFormat, '%', 'HIGHER_IS_BETTER', 'vs forecast') : null,
        facts: [
            fact('Forecast', hasForecast ? formatCompactCurrency(kpi.forecastRevenue, kpi.currency) : EM_DASH),
            fact('Yield per RPK', `${kpi.currency} ${yieldFormat.format(kpi.yieldPerRpk)}`, yieldSentiment),
        ],
        visual: {
            kind: 'METER',
            fraction: hasForecast ? clamp01(kpi.dailyRevenue / kpi.forecastRevenue) : 0,
            markerFraction: null,
            caption: hasForecast
                ? `${integerFormat.format((kpi.dailyRevenue / kpi.forecastRevenue) * 100)}% of daily forecast`
                : 'No forecast set',
        },
        route: meta.route,
        domainLabel: meta.domainLabel,
    });
}


export const kpiCardEquals = (a: KpiCardViewModel, b: KpiCardViewModel): boolean =>
    a === b || JSON.stringify(a) === JSON.stringify(b);