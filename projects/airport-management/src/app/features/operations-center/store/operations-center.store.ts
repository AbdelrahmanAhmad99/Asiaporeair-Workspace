

import { isPlatformBrowser } from '@angular/common';
import {
    DestroyRef,
    Injectable,
    InjectionToken,
    NgZone,
    PLATFORM_ID,
    Signal,
    computed,
    inject,
    signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import {
    EMPTY,
    Observable,
    Subscription,
    bufferTime,
    catchError,
    concat,
    defer,
    exhaustMap,
    filter,
    ignoreElements,
    merge,
    repeat,
    retry,
    startWith,
    switchMap,
    tap,
    throwError,
    timer,
} from 'rxjs';

import { RoutableSearchKind, SEARCH_DESTINATIONS } from '../models/command-bar.models';
import {
    AirborneFlightMarker,
    AlertSeverity,
    AlertStatus,
    ConnectionPhase,
    ConnectionRecoveryIndicator,
    ConnectionStatus,
    EpochMillis,
    ExecutiveKPIs,
    GlobalSearchResolution,
    GlobalSystemHealth,
    OperationalAlert,
    OperationalDomain,
    OperationsCenterState,
    OperationsFeedEvent,
    OperationsFeedGateway,
    OperationsSnapshot,
    SearchOutcome,
    SearchTargetKind,
    ServiceHealth,
    ServiceStatus,
    TrendDirection,
} from '../models/operations-center.models';

// ─────────────────────────────────────────────────────────────────────────────
// Tunables
// ─────────────────────────────────────────────────────────────────────────────

const FEED_BATCH_WINDOW_MS = 250;
export const MAX_STREAM_RETRIES = 6;
const BACKOFF_BASE_MS = 1_000;
const BACKOFF_CEILING_MS = 30_000;
const POLLING_INTERVAL_MS = 15_000;
const LIVE_PROBE_AFTER_POLLING_MS = 60_000;
const STALE_AFTER_MS = 45_000;
const MAX_RETAINED_ALERTS = 500;

export const OPERATIONS_FEED_GATEWAY = new InjectionToken<OperationsFeedGateway>(
    'OPERATIONS_FEED_GATEWAY',
);

// ─────────────────────────────────────────────────────────────────────────────
// Zulu Time Engine
// ─────────────────────────────────────────────────────────────────────────────

const MS_PER_SECOND = 1_000;
const MONTHS_UTC = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'] as const;

const floorToSecond = (epochMs: EpochMillis): EpochMillis =>
    Math.floor(epochMs / MS_PER_SECOND) * MS_PER_SECOND;
const pad2 = (n: number): string => (n < 10 ? `0${n}` : `${n}`);


export function createZuluClock(zone: NgZone, destroyRef: DestroyRef, isBrowser: boolean): Signal<EpochMillis> {
    const epochMs = signal<EpochMillis>(floorToSecond(Date.now()));

    if (isBrowser) {
        zone.runOutsideAngular(() => {
            defer(() => timer(MS_PER_SECOND - (Date.now() % MS_PER_SECOND) + 2))
                .pipe(repeat(), takeUntilDestroyed(destroyRef))
                .subscribe(() => epochMs.set(floorToSecond(Date.now())));
        });
    }

    return epochMs.asReadonly();
}

export function formatZuluClock(epochMs: EpochMillis): string {
    const d = new Date(epochMs);
    return `${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}:${pad2(d.getUTCSeconds())}Z`;
}

export function formatZuluDate(epochMs: EpochMillis): string {
    const d = new Date(epochMs);
    return `${pad2(d.getUTCDate())} ${MONTHS_UTC[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Global search classification (pure, unit-testable)
// ─────────────────────────────────────────────────────────────────────────────

const SEARCH_PATTERNS = {
    crew: /^(?:EMP|CRW|PLT|FA)-\d{4,6}$/,
    tail: /^[A-Z0-9]{1,2}-[A-Z0-9]{2,5}$/,
    flight: /^[A-Z0-9]{2}\d{1,4}[A-Z]?$/,
    pnr: /^[A-Z0-9]{6}$/,
} as const;

const EXPLICIT_PNR_PREFIX = /^PNR:/;

export interface ClassifiedSearchQuery {
    readonly kind: SearchTargetKind;
    readonly normalized: string;
}

export function classifySearchQuery(rawQuery: string): ClassifiedSearchQuery | null {
    let normalized = rawQuery.trim().toUpperCase().replace(/\s+/g, '');
    if (normalized.length === 0) {
        return null;
    }

    if (EXPLICIT_PNR_PREFIX.test(normalized)) {
        normalized = normalized.replace(EXPLICIT_PNR_PREFIX, '');
        return SEARCH_PATTERNS.pnr.test(normalized)
            ? { kind: SearchTargetKind.PNR, normalized }
            : { kind: SearchTargetKind.UNKNOWN, normalized };
    }
    if (SEARCH_PATTERNS.crew.test(normalized)) return { kind: SearchTargetKind.CREW_ID, normalized };
    if (SEARCH_PATTERNS.tail.test(normalized)) return { kind: SearchTargetKind.TAIL_NUMBER, normalized };
    if (SEARCH_PATTERNS.flight.test(normalized)) return { kind: SearchTargetKind.FLIGHT_NUMBER, normalized };
    if (SEARCH_PATTERNS.pnr.test(normalized)) return { kind: SearchTargetKind.PNR, normalized };
    return { kind: SearchTargetKind.UNKNOWN, normalized };
}

const routeFor = (kind: RoutableSearchKind, id: string): readonly string[] => [SEARCH_DESTINATIONS[kind].path, id];

// ─────────────────────────────────────────────────────────────────────────────
// Pure reducers & helpers (exported for unit tests)
// ─────────────────────────────────────────────────────────────────────────────

const SEVERITY_RANK: Readonly<Record<AlertSeverity, number>> = {
    [AlertSeverity.CRITICAL]: 0,
    [AlertSeverity.WARNING]: 1,
    [AlertSeverity.INFO]: 2,
};

export function sortAndCapAlerts(alerts: Iterable<OperationalAlert>): readonly OperationalAlert[] {
    return Array.from(alerts)
        .sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity] || b.timestamp - a.timestamp)
        .slice(0, MAX_RETAINED_ALERTS);
}


export function reduceFeedBatch(
    state: OperationsCenterState,
    events: readonly OperationsFeedEvent[],
    receivedAt: EpochMillis,
): OperationsCenterState {
    let systemHealth = state.systemHealth;
    let kpiMetrics = state.kpiMetrics;
    let fleetDraft: Map<string, AirborneFlightMarker> | null = null;
    let alertDraft: Map<string, OperationalAlert> | null = null;

    for (const event of events) {
        switch (event.type) {
            case 'HEALTH_UPDATE':
                systemHealth = event.health;
                break;
            case 'KPI_UPDATE':
                kpiMetrics = event.kpis;
                break;
            case 'FLEET_UPSERT': {
                fleetDraft ??= new Map(state.fleet);
                for (const marker of event.markers) {
                    const current = fleetDraft.get(marker.flightNumber);
                    // Discard out-of-order position reports.
                    if (current === undefined || marker.updatedAt >= current.updatedAt) {
                        fleetDraft.set(marker.flightNumber, marker);
                    }
                }
                break;
            }
            case 'FLEET_REMOVE': {
                fleetDraft ??= new Map(state.fleet);
                for (const flightNumber of event.flightNumbers) {
                    fleetDraft.delete(flightNumber);
                }
                break;
            }
            case 'ALERT_RAISED':
                alertDraft ??= new Map(state.alerts.map((a): [string, OperationalAlert] => [a.id, a]));
                alertDraft.set(event.alert.id, event.alert);
                break;
            case 'ALERT_RESOLVED':
                alertDraft ??= new Map(state.alerts.map((a): [string, OperationalAlert] => [a.id, a]));
                alertDraft.delete(event.alertId);
                break;
            case 'HEARTBEAT':
                break;
            default: {
                const unhandled: never = event;
                void unhandled;
            }
        }
    }

    return {
        ...state,
        systemHealth,
        kpiMetrics,
        alerts: alertDraft !== null ? sortAndCapAlerts(alertDraft.values()) : state.alerts,
        fleet: fleetDraft ?? state.fleet,
        lastSyncedAt: receivedAt,
    };
}

function describeError(error: unknown): string {
    return error instanceof Error ? error.message : 'Unknown telemetry fault';
}

function computeBackoffMs(attempt: number): number {
    const exponential = Math.min(BACKOFF_CEILING_MS, BACKOFF_BASE_MS * 2 ** (attempt - 1));
    return Math.round(exponential * (0.8 + Math.random() * 0.4));
}

function healthyService(now: EpochMillis): ServiceHealth {
    return { status: ServiceStatus.OPERATIONAL, latencyMs: 0, checkedAt: now };
}

function createInitialSystemHealth(now: EpochMillis): GlobalSystemHealth {
    return {
        apiGateway: healthyService(now),
        webSocketStream: healthyService(now),
        database: healthyService(now),
        occServer: healthyService(now),
        domainGateways: {
            [OperationalDomain.NETWORK]: healthyService(now),
            [OperationalDomain.FLEET]: healthyService(now),
            [OperationalDomain.WORKFORCE]: healthyService(now),
            [OperationalDomain.PLANNING]: healthyService(now),
            [OperationalDomain.COMMERCIAL]: healthyService(now),
            [OperationalDomain.RESERVATION]: healthyService(now),
        },
    };
}

function createInitialKpis(now: EpochMillis): ExecutiveKPIs {
    return {
        activeFlights: { total: 0, delta: 0, forecastTotal: 0 },
        otpRate: {
            percentage: 0,
            trend: TrendDirection.FLAT,
            trendDeltaPct: 0,
            forecastPercentage: 0,
            averageDelayMinutes: 0,
            delayVarianceMinutes: 0,
        },
        fleetAvailability: {
            readinessRatio: 0,
            availableAircraft: 0,
            totalAircraft: 0,
            inMaintenanceCount: 0,
            aogCount: 0,
            forecastReadinessRatio: 0,
        },
        crew: {
            rosteredToday: 0,
            onDutyNow: 0,
            standbyAvailable: 0,
            expiringCertifications: 0,
            dutyCompliancePct: 0,
            forecastDutyCompliancePct: 0,
        },
        network: {
            activeAirports: 0,
            operationalRoutes: 0,
            restrictedAirports: 0,
            hubsOperational: 0,
            hubsTotal: 0,
            forecastOperationalRoutes: 0,
        },
        revenue: {
            dailyRevenue: 0,
            currency: 'SGD',
            deltaPct: 0,
            forecastRevenue: 0,
            yieldPerRpk: 0,
            forecastYieldPerRpk: 0,
            activePricingRules: 0,
        },
        reservations: { bookingsToday: 0, checkInRatePct: 0, activeGates: 0, totalGates: 0 },
        generatedAt: now,
    };
}

function createInitialState(now: EpochMillis): OperationsCenterState {
    return {
        systemHealth: createInitialSystemHealth(now),
        kpiMetrics: createInitialKpis(now),
        alerts: [],
        fleet: new Map<string, AirborneFlightMarker>(),
        searchQuery: '',
        searchResolution: null,
        isLoading: false,
        connection: { phase: ConnectionPhase.CONNECTING, attempt: 0, nextRetryAt: null, lastError: null },
        lastSyncedAt: null,
        actionError: null,
    };
}

const EMPTY_BATCH: readonly OperationsFeedEvent[] = [];

// ─────────────────────────────────────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────────────────────────────────────

@Injectable()
export class OperationsCenterStore {
    private readonly gateway = inject(OPERATIONS_FEED_GATEWAY);
    private readonly router = inject(Router);
    private readonly zone = inject(NgZone);
    private readonly destroyRef = inject(DestroyRef);
    private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

    private readonly state = signal<OperationsCenterState>(createInitialState(Date.now()));

    private feedSubscription: Subscription | null = null;
    private refreshSubscription: Subscription | null = null;

    // ── Zulu Time Engine ───────────────────────────────────────────────────────
    readonly zuluTimeSignal: Signal<EpochMillis> = createZuluClock(this.zone, this.destroyRef, this.isBrowser);
    readonly formattedZuluClock: Signal<string> = computed(() => formatZuluClock(this.zuluTimeSignal()));
    readonly formattedZuluDate: Signal<string> = computed(() => formatZuluDate(this.zuluTimeSignal()));

    // ── Read-only slice selectors ──────────────────────────────────────────────
    readonly systemHealth: Signal<GlobalSystemHealth> = computed(() => this.state().systemHealth);
    readonly kpiMetrics: Signal<ExecutiveKPIs> = computed(() => this.state().kpiMetrics);
    /** All retained alerts, severity-sorted. */
    readonly alertsStream: Signal<readonly OperationalAlert[]> = computed(() => this.state().alerts);
    readonly searchQuery: Signal<string> = computed(() => this.state().searchQuery);
    readonly searchResolution: Signal<GlobalSearchResolution | null> = computed(() => this.state().searchResolution);
    readonly isLoading: Signal<boolean> = computed(() => this.state().isLoading);
    readonly connectionStatus: Signal<ConnectionStatus> = computed(() => this.state().connection);
    readonly lastSyncedAt: Signal<EpochMillis | null> = computed(() => this.state().lastSyncedAt);
    readonly actionError: Signal<string | null> = computed(() => this.state().actionError);

    private readonly fleetMap = computed(() => this.state().fleet);
    /** Active aircraft; the array is rebuilt only when the fleet slice actually changes. */
    readonly airborneFleet: Signal<readonly AirborneFlightMarker[]> = computed(() =>
        Array.from(this.fleetMap().values()),
    );

    // ── Derived state ──────────────────────────────────────────────────────────
    /** Alerts still requiring attention. */
    readonly activeAlerts: Signal<readonly OperationalAlert[]> = computed(() =>
        this.alertsStream().filter((a) => a.status === AlertStatus.ACTIVE),
    );

    /** Unacknowledged CRITICAL (AOG / Emergency) alerts. */
    readonly criticalAlertsCount: Signal<number> = computed(() => {
        let count = 0;
        for (const alert of this.alertsStream()) {
            if (alert.severity === AlertSeverity.CRITICAL && alert.status === AlertStatus.ACTIVE) count++;
        }
        return count;
    });

    /** True when no confirmed telemetry has arrived recently. Re-evaluated on the 1 Hz clock. */
    readonly isTelemetryStale: Signal<boolean> = computed(() => {
        const last = this.lastSyncedAt();
        return last !== null && this.zuluTimeSignal() - last > STALE_AFTER_MS;
    });

    /** Live link + fresh data + all 4 platform services + all 6 domain gateways operational. */
    readonly isSystemFullyOperational: Signal<boolean> = computed(() => {
        if (this.connectionStatus().phase !== ConnectionPhase.LIVE || this.isTelemetryStale()) return false;
        const h = this.systemHealth();
        const services: readonly ServiceHealth[] = [
            h.apiGateway,
            h.webSocketStream,
            h.database,
            h.occServer,
            ...Object.values(h.domainGateways),
        ];
        return services.every((s) => s.status === ServiceStatus.OPERATIONAL);
    });

    readonly connectionRecovery: Signal<ConnectionRecoveryIndicator> = computed(() => {
        const { phase, attempt, nextRetryAt } = this.connectionStatus();
        const base = { attempt, maxAttempts: MAX_STREAM_RETRIES, nextRetryAt } as const;

        switch (phase) {
            case ConnectionPhase.RECONNECTING:
                return {
                    ...base,
                    visible: true,
                    tone: 'RECOVERING',
                    headline: 'Re-establishing your live feed',
                    detail: 'Showing the last confirmed operational picture while we reconnect.',
                };
            case ConnectionPhase.POLLING:
                return {
                    ...base,
                    visible: true,
                    tone: 'DEGRADED',
                    headline: 'Live feed paused',
                    detail: 'Operating on scheduled refresh. Real-time streaming will resume automatically.',
                };
            case ConnectionPhase.OFFLINE:
                return {
                    ...base,
                    visible: true,
                    tone: 'OFFLINE',
                    headline: 'Operations feed unavailable',
                    detail: 'Displaying the last confirmed data. Use Refresh to retry.',
                };
            case ConnectionPhase.LIVE:
                return this.isTelemetryStale()
                    ? {
                        ...base,
                        visible: true,
                        tone: 'DEGRADED',
                        headline: 'Awaiting fresh telemetry',
                        detail: 'The link is open but no recent updates have arrived.',
                    }
                    : { ...base, visible: false, tone: 'NONE', headline: '', detail: '' };
            case ConnectionPhase.CONNECTING:
            default:
                return { ...base, visible: false, tone: 'NONE', headline: '', detail: '' };
        }
    });

    // ───────────────────────────────────────────────────────────────────────────
    // Actions
    // ───────────────────────────────────────────────────────────────────────────

    /** Idempotent. Hydrates from a snapshot, then opens the push stream (with recovery ladder). */
    initializeOperationsFeed(): void {
        if (this.feedSubscription !== null && !this.feedSubscription.closed) return;
        this.startFeed();
    }


    refreshTelemetry(): void {
        if (this.state().connection.phase !== ConnectionPhase.LIVE) {
            this.startFeed();
            return;
        }

        this.refreshSubscription?.unsubscribe();
        this.patch({ isLoading: true });
        this.refreshSubscription = this.gateway
            .loadSnapshot()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (snapshot) => this.applySnapshot(snapshot),
                error: (error: unknown) => {
                    this.patch({ isLoading: false });
                    this.patchConnection({ lastError: describeError(error) });
                },
            });
    }

    /** Optimistic acknowledge with rollback if the server rejects it. */
    acknowledgeAlert(alertId: string): void {
        const target = this.state().alerts.find((a) => a.id === alertId);
        if (target === undefined || target.status === AlertStatus.ACKNOWLEDGED) return;

        this.setAlertStatus(alertId, AlertStatus.ACKNOWLEDGED, Date.now());

        this.gateway
            .acknowledgeAlert(alertId)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                complete: () => this.patch({ actionError: null }),
                error: () => {
                    this.setAlertStatus(alertId, AlertStatus.ACTIVE, null);
                    this.patch({ actionError: `Alert ${target.entityId} could not be acknowledged. Please try again.` });
                },
            });
    }

    clearActionError(): void {
        this.patch({ actionError: null });
    }


    executeGlobalSearch(query: string): GlobalSearchResolution | null {
        const classified = classifySearchQuery(query);
        if (classified === null) {
            this.patch({ searchQuery: '', searchResolution: null });
            return null;
        }

        const { kind, normalized } = classified;
        const fleet = this.fleetMap();
        let resolution: GlobalSearchResolution;

        switch (kind) {
            case SearchTargetKind.FLIGHT_NUMBER: {
                resolution = this.navigateResolution(normalized, kind, routeFor(kind, normalized), fleet.get(normalized) ?? null);
                break;
            }
            case SearchTargetKind.TAIL_NUMBER: {
                let live: AirborneFlightMarker | null = null;
                for (const marker of fleet.values()) {
                    if (marker.tailNumber === normalized) {
                        live = marker;
                        break;
                    }
                }
                resolution = this.navigateResolution(normalized, kind, routeFor(kind, normalized), live);
                break;
            }
            case SearchTargetKind.PNR:
                resolution = this.navigateResolution(normalized, kind, routeFor(kind, normalized));
                break;
            case SearchTargetKind.CREW_ID:
                resolution = this.navigateResolution(normalized, kind, routeFor(kind, normalized));
                break;
            case SearchTargetKind.UNKNOWN:
            default:
                resolution = { query: normalized, kind: SearchTargetKind.UNKNOWN, outcome: SearchOutcome.NO_MATCH, commands: null, preview: null };
        }

        this.patch({ searchQuery: query, searchResolution: resolution });

        if (resolution.outcome === SearchOutcome.NAVIGATE && resolution.commands !== null) {
            void this.router.navigate([...resolution.commands]);
        }
        return resolution;
    }

    // ───────────────────────────────────────────────────────────────────────────
    // Live pipeline
    // ───────────────────────────────────────────────────────────────────────────

    /**
     * snapshot → stream, as one unit, so EVERY retry re-syncs from a fresh snapshot
     * (no gaps after a reconnect). Subscribed outside the zone: socket frames and batch
     * timers never trigger zone-wide change detection; signal writes still schedule renders.
     */
    private startFeed(): void {
        this.feedSubscription?.unsubscribe();
        this.patch({ isLoading: true });
        this.patchConnection({ phase: ConnectionPhase.CONNECTING, attempt: 0, nextRetryAt: null });

        const feed$ = defer(() => this.gateway.loadSnapshot()).pipe(
            tap((snapshot) => {
                this.applySnapshot(snapshot);
                this.patchConnection({ phase: ConnectionPhase.LIVE, attempt: 0, nextRetryAt: null, lastError: null });
            }),
            switchMap(() => this.liveBatches$()),
        );

        this.feedSubscription = this.zone.runOutsideAngular(() =>
            feed$
                .pipe(
                    retry({
                        count: MAX_STREAM_RETRIES,
                        resetOnSuccess: true,
                        delay: (error: unknown, attempt: number) => this.beginRecovery(error, attempt),
                    }),
                    catchError((error: unknown) => this.enterPollingFallback$(error)),
                    takeUntilDestroyed(this.destroyRef),
                )
                .subscribe((batch) => {
                    if (batch.length > 0) {
                        this.state.update((s) => reduceFeedBatch(s, batch, Date.now()));
                    }
                }),
        );
    }

    /**
     * Coalesced push batches. The leading empty batch lets `retry({ resetOnSuccess })`
     * know the attempt succeeded. A server-side completion is treated as a drop.
     */
    private liveBatches$(): Observable<readonly OperationsFeedEvent[]> {
        const batches$ = this.gateway.connect().pipe(
            bufferTime(FEED_BATCH_WINDOW_MS),
            filter((batch) => batch.length > 0),
        );
        return concat(
            batches$,
            throwError(() => new Error('Telemetry stream closed by server')),
        ).pipe(startWith(EMPTY_BATCH));
    }

    private beginRecovery(error: unknown, attempt: number): Observable<number> {
        const delayMs = computeBackoffMs(attempt);
        this.patch({ isLoading: false });
        this.patchConnection({
            phase: ConnectionPhase.RECONNECTING,
            attempt,
            nextRetryAt: Date.now() + delayMs,
            lastError: describeError(error),
        });
        return timer(delayMs);
    }

    /** Retries exhausted: poll snapshots, and periodically probe for the live stream again. */
    private enterPollingFallback$(error: unknown): Observable<never> {
        this.patch({ isLoading: false });
        this.patchConnection({
            phase: ConnectionPhase.POLLING,
            attempt: MAX_STREAM_RETRIES,
            nextRetryAt: null,
            lastError: describeError(error),
        });

        const poll$ = timer(0, POLLING_INTERVAL_MS).pipe(
            exhaustMap(() =>
                this.gateway.loadSnapshot().pipe(
                    tap((snapshot) => {
                        this.applySnapshot(snapshot);
                        this.patchConnection({ phase: ConnectionPhase.POLLING, lastError: null });
                    }),
                    catchError((pollError: unknown) => {
                        this.patchConnection({ phase: ConnectionPhase.OFFLINE, lastError: describeError(pollError) });
                        return EMPTY;
                    }),
                ),
            ),
            ignoreElements(),
        );

        const probe$ = timer(LIVE_PROBE_AFTER_POLLING_MS).pipe(
            tap(() => this.startFeed()),
            ignoreElements(),
        );

        return merge(poll$, probe$);
    }

    // ───────────────────────────────────────────────────────────────────────────
    // State helpers
    // ───────────────────────────────────────────────────────────────────────────

    private applySnapshot(snapshot: OperationsSnapshot): void {
        const fleet = new Map<string, AirborneFlightMarker>();
        for (const marker of snapshot.airborneFleet) {
            fleet.set(marker.flightNumber, marker);
        }

        this.state.update((s) => ({
            ...s,
            systemHealth: snapshot.systemHealth,
            kpiMetrics: snapshot.kpis,
            alerts: sortAndCapAlerts(snapshot.alerts),
            fleet,
            isLoading: false,
            lastSyncedAt: Date.now(),
        }));
    }

    private setAlertStatus(alertId: string, status: AlertStatus, acknowledgedAt: EpochMillis | null): void {
        this.state.update((s) => ({
            ...s,
            alerts: s.alerts.map((a) => (a.id === alertId ? { ...a, status, acknowledgedAt } : a)),
        }));
    }

    private navigateResolution(
        query: string,
        kind: SearchTargetKind,
        commands: readonly string[],
        preview: AirborneFlightMarker | null = null,
    ): GlobalSearchResolution {
        // `preview` carries live telemetry when the target is airborne, so callers can enrich the
        // destination without a second lookup. Navigation always happens.
        return { query, kind, outcome: SearchOutcome.NAVIGATE, commands, preview };
    }

    private patch(partial: Partial<OperationsCenterState>): void {
        this.state.update((s) => ({ ...s, ...partial }));
    }

    private patchConnection(partial: Partial<ConnectionStatus>): void {
        this.state.update((s) => ({ ...s, connection: { ...s.connection, ...partial } }));
    }
}