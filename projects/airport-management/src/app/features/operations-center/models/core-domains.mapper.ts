
import { ROLE_BADGE_CONFIG, UserRole } from './command-bar.models';
import { isRoleAllowed } from '../config/core-domains.config';
import {
    GatewayCardViewModel,
    GatewayDomainConfig,
    GatewayDomainId,
    GatewayMetricView,
    GatewaySubLinkView,
    GatewayTelemetryView,
    LockedPresentation,
    MetricTone,
} from './core-domains.models';
import { KpiStatusTone } from './executive-kpi.models';
import { ConnectionPhase, ExecutiveKPIs } from './operations-center.models';
import {
    KPI_THRESHOLDS,
    KpiBuildContext,
    buildActiveFlightsCard,
    buildCrewCard,
    buildFleetCard,
    buildNetworkCard,
    buildOtpCard,
    buildRevenueCard,
} from './executive-kpi.mapper';

// ─────────────────────────────────────────────────────────────────────────────
// Formatting
// ─────────────────────────────────────────────────────────────────────────────
const EM_DASH = '\u2014';
const MINUS = '\u2212';

const integerFormat = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const oneDecimalFormat = new Intl.NumberFormat('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const compactFormat = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });

const signedPercent = (value: number): string => {
    const abs = oneDecimalFormat.format(Math.abs(value));
    return value > 0 ? `+${abs}%` : value < 0 ? `${MINUS}${abs}%` : `${abs}%`;
};

const metric = (label: string, value: string, tone: MetricTone = 'NEUTRAL'): GatewayMetricView => ({
    label,
    value,
    tone,
});

// ─────────────────────────────────────────────────────────────────────────────
// Telemetry
// ─────────────────────────────────────────────────────────────────────────────
const STATUS_LABEL: Readonly<Record<KpiStatusTone, string>> = {
    NOMINAL: 'Live',
    WATCH: 'Watch',
    CRITICAL: 'Critical',
    PENDING: 'Awaiting data',
};

const TONE_RANK: Readonly<Record<KpiStatusTone, number>> = { PENDING: 0, NOMINAL: 0, WATCH: 1, CRITICAL: 2 };
const worstTone = (...tones: readonly KpiStatusTone[]): KpiStatusTone =>
    tones.reduce<KpiStatusTone>((w, t) => (TONE_RANK[t] > TONE_RANK[w] ? t : w), 'NOMINAL');

const telemetry = (tone: KpiStatusTone, metrics: readonly GatewayMetricView[]): GatewayTelemetryView => ({
    tone,
    statusLabel: STATUS_LABEL[tone],
    metrics,
});

const PENDING_LABELS: Readonly<Record<GatewayDomainId, readonly [string, string]>> = {
    [GatewayDomainId.FLIGHT_OPERATIONS]: ['airborne', 'OTP today'],
    [GatewayDomainId.FLEET_ASSETS]: ['active aircraft', 'AOG'],
    [GatewayDomainId.CREW_INTELLIGENCE]: ['crew on duty', 'duty compliance'],
    [GatewayDomainId.NETWORK_INFRA]: ['hubs operational', 'active routes'],
    [GatewayDomainId.COMMERCIAL_REVENUE]: ['yield vs forecast', 'pricing rules'],
    [GatewayDomainId.RESERVATION_GROUND]: ['bookings today', 'gates active'],
};

function pendingTelemetry(id: GatewayDomainId, ctx: KpiBuildContext): GatewayTelemetryView {
    const offline = ctx.connection.phase === ConnectionPhase.OFFLINE;
    const [first, second] = PENDING_LABELS[id];
    return {
        tone: offline ? 'CRITICAL' : 'PENDING',
        statusLabel: offline ? 'Offline' : STATUS_LABEL.PENDING,
        metrics: [metric(first, EM_DASH), metric(second, EM_DASH)],
    };
}

function telemetryFor(id: GatewayDomainId, kpis: ExecutiveKPIs, ctx: KpiBuildContext): GatewayTelemetryView {
    if (!ctx.hasData) return pendingTelemetry(id, ctx);

    switch (id) {
        case GatewayDomainId.FLIGHT_OPERATIONS: {
            const otp = kpis.otpRate;
            const otpTone: MetricTone =
                otp.percentage < KPI_THRESHOLDS.otp.criticalBelowPct
                    ? 'BAD'
                    : otp.percentage < KPI_THRESHOLDS.otp.watchBelowPct
                        ? 'WARN'
                        : 'NEUTRAL';
            return telemetry(
                worstTone(
                    buildOtpCard(otp, ctx).status.tone,
                    buildActiveFlightsCard(kpis.activeFlights, ctx).status.tone,
                ),
                [
                    metric('airborne', integerFormat.format(kpis.activeFlights.total)),
                    metric('OTP today', `${oneDecimalFormat.format(otp.percentage)}%`, otpTone),
                ],
            );
        }

        case GatewayDomainId.FLEET_ASSETS: {
            const fleet = kpis.fleetAvailability;
            const aogTone: MetricTone =
                fleet.aogCount >= KPI_THRESHOLDS.fleet.criticalAogCount ? 'BAD' : fleet.aogCount > 0 ? 'WARN' : 'NEUTRAL';
            return telemetry(buildFleetCard(fleet, ctx).status.tone, [
                metric('active aircraft', integerFormat.format(fleet.availableAircraft)),
                metric('AOG', integerFormat.format(fleet.aogCount), aogTone),
            ]);
        }

        case GatewayDomainId.CREW_INTELLIGENCE: {
            const crew = kpis.crew;
            const complianceTone: MetricTone =
                crew.dutyCompliancePct < KPI_THRESHOLDS.crew.criticalBelowPct
                    ? 'BAD'
                    : crew.dutyCompliancePct < KPI_THRESHOLDS.crew.watchBelowPct
                        ? 'WARN'
                        : 'NEUTRAL';
            return telemetry(buildCrewCard(crew, ctx).status.tone, [
                metric('crew on duty', integerFormat.format(crew.onDutyNow)),
                metric('duty compliance', `${oneDecimalFormat.format(crew.dutyCompliancePct)}%`, complianceTone),
            ]);
        }

        case GatewayDomainId.NETWORK_INFRA: {
            const network = kpis.network;
            return telemetry(buildNetworkCard(network, ctx).status.tone, [
                metric(
                    'hubs operational',
                    `${integerFormat.format(network.hubsOperational)} of ${integerFormat.format(network.hubsTotal)}`,
                    network.hubsOperational < network.hubsTotal ? 'WARN' : 'NEUTRAL',
                ),
                metric('active routes', integerFormat.format(network.operationalRoutes)),
            ]);
        }

        case GatewayDomainId.COMMERCIAL_REVENUE: {
            const revenue = kpis.revenue;
            const hasYieldForecast = revenue.forecastYieldPerRpk > 0;
            const yieldVariance = hasYieldForecast
                ? ((revenue.yieldPerRpk - revenue.forecastYieldPerRpk) / revenue.forecastYieldPerRpk) * 100
                : 0;
            const yieldTone: MetricTone = !hasYieldForecast
                ? 'NEUTRAL'
                : yieldVariance < KPI_THRESHOLDS.revenue.criticalBelowForecastPct
                    ? 'BAD'
                    : yieldVariance < KPI_THRESHOLDS.revenue.watchBelowForecastPct
                        ? 'WARN'
                        : 'NEUTRAL';
            return telemetry(buildRevenueCard(revenue, ctx).status.tone, [
                metric('yield vs forecast', hasYieldForecast ? signedPercent(yieldVariance) : EM_DASH, yieldTone),
                metric('pricing rules', integerFormat.format(revenue.activePricingRules)),
            ]);
        }

        case GatewayDomainId.RESERVATION_GROUND: {
            const reservations = kpis.reservations;
            // Gate activity follows the flying programme (quiet overnight is normal), so it never raises a tone.
            return telemetry('NOMINAL', [
                metric('bookings today', compactFormat.format(reservations.bookingsToday)),
                metric(
                    'gates active',
                    `${integerFormat.format(reservations.activeGates)} of ${integerFormat.format(reservations.totalGates)}`,
                ),
            ]);
        }

        default: {
            const unhandled: never = id;
            return unhandled;
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// RBAC → view-model
// ─────────────────────────────────────────────────────────────────────────────
const roleLabel = (role: UserRole): string => ROLE_BADGE_CONFIG[role].label;

/** `A`, `A or B`, `A, B or C`. */
export function joinRoleLabels(roles: readonly UserRole[]): string {
    const labels = roles.map(roleLabel);
    if (labels.length <= 1) return labels.join('');
    return `${labels.slice(0, -1).join(', ')} or ${labels[labels.length - 1]}`;
}

function buildLockedCard(domain: GatewayDomainConfig): GatewayCardViewModel {
    return {
        id: domain.id,
        title: domain.title,
        description: domain.description,
        primaryActionLabel: domain.primaryActionLabel,
        primaryRoute: domain.primaryRoute,
        access: 'LOCKED',
        telemetry: null, // restricted figures never reach a role that cannot enter the domain
        subLinks: [],
        restriction: {
            badgeLabel: 'Restricted',
            note: domain.restrictionNote,
            clearanceLabel: `Requires ${joinRoleLabels(domain.allowedRoles)} clearance.`,
            requiredRoles: domain.allowedRoles,
        },
    };
}


export function buildGatewayCard(
    domain: GatewayDomainConfig,
    role: UserRole,
    presentation: LockedPresentation,
    kpis: () => ExecutiveKPIs,
    context: () => KpiBuildContext,
): GatewayCardViewModel | null {
    if (!isRoleAllowed(domain.allowedRoles, role)) {
        return presentation === 'HIDE' ? null : buildLockedCard(domain);
    }

    const subLinks: GatewaySubLinkView[] = [];
    for (const link of domain.subLinks) {
        const allowed = isRoleAllowed(link.allowedRoles, role);
        if (!allowed && presentation === 'HIDE') continue;
        subLinks.push({
            id: link.id,
            label: link.label,
            route: link.route,
            isLocked: !allowed,
            lockHint: allowed ? null : `Requires ${joinRoleLabels(link.allowedRoles)} clearance`,
        });
    }

    return {
        id: domain.id,
        title: domain.title,
        description: domain.description,
        primaryActionLabel: domain.primaryActionLabel,
        primaryRoute: domain.primaryRoute,
        access: 'GRANTED',
        telemetry: telemetryFor(domain.id, kpis(), context()),
        subLinks,
        restriction: null,
    };
}

/** Structural equality for `computed({ equal })`; an unchanged card keeps its identity and its OnPush view. */
export const gatewayCardEquals = (a: GatewayCardViewModel | null, b: GatewayCardViewModel | null): boolean =>
    a === b || JSON.stringify(a) === JSON.stringify(b);