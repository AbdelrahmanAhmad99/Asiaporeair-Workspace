import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';

import {
  HealthDiagnostic,
  HealthDiagnosticRow,
  HealthTone,
} from '../../models/command-bar.models';
import {
  ConnectionPhase,
  ConnectionRecoveryIndicator,
  ConnectionStatus,
  EpochMillis,
  GlobalSystemHealth,
  ServiceHealth,
  ServiceStatus,
} from '../../models/operations-center.models';
import { formatZuluClock } from '../../store/operations-center.store';

/** API / DB round-trips slower than this are reported as degraded even when the service says "up". */
const LATENCY_DEGRADED_MS = 400;

const STATUS_RANK: Readonly<Record<ServiceStatus, number>> = {
  [ServiceStatus.OPERATIONAL]: 0,
  [ServiceStatus.DEGRADED]: 1,
  [ServiceStatus.DOWN]: 2,
};

const STATUS_WORD: Readonly<Record<ServiceStatus, string>> = {
  [ServiceStatus.OPERATIONAL]: 'Operational',
  [ServiceStatus.DEGRADED]: 'Degraded',
  [ServiceStatus.DOWN]: 'Down',
};

let nextHealthInstanceId = 0;

const worstOf = (statuses: readonly ServiceStatus[]): ServiceStatus =>
  statuses.reduce<ServiceStatus>(
    (worst, s) => (STATUS_RANK[s] > STATUS_RANK[worst] ? s : worst),
    ServiceStatus.OPERATIONAL,
  );

const readLatency = (ms: number | null): string => (ms === null ? 'No signal' : `${Math.round(ms)} ms`);

/** Applies the latency budget on top of the status the backend reports. */
function budgetedStatus(service: ServiceHealth): ServiceStatus {
  return service.status === ServiceStatus.OPERATIONAL &&
    service.latencyMs !== null &&
    service.latencyMs > LATENCY_DEGRADED_MS
    ? ServiceStatus.DEGRADED
    : service.status;
}

function describeLink(
  connection: ConnectionStatus,
  isStale: boolean,
): { readonly status: ServiceStatus; readonly reading: string } {
  switch (connection.phase) {
    case ConnectionPhase.LIVE:
      return isStale
        ? { status: ServiceStatus.DEGRADED, reading: 'No recent updates' }
        : { status: ServiceStatus.OPERATIONAL, reading: 'Live' };
    case ConnectionPhase.CONNECTING:
      return { status: ServiceStatus.DEGRADED, reading: 'Connecting' };
    case ConnectionPhase.RECONNECTING:
      return { status: ServiceStatus.DEGRADED, reading: `Reconnecting, attempt ${connection.attempt}` };
    case ConnectionPhase.POLLING:
      return { status: ServiceStatus.DEGRADED, reading: 'Scheduled refresh' };
    case ConnectionPhase.OFFLINE:
    default:
      return { status: ServiceStatus.DOWN, reading: 'Offline' };
  }
}

function pillLabel(tone: HealthTone, connection: ConnectionStatus, isStale: boolean): string {
  if (tone === 'OPTIMAL') return 'Systems nominal';
  if (tone === 'CRITICAL') {
    return connection.phase === ConnectionPhase.OFFLINE ? 'Feed offline' : 'Service disruption';
  }
  switch (connection.phase) {
    case ConnectionPhase.RECONNECTING:
      return 'Reconnecting';
    case ConnectionPhase.POLLING:
      return 'Delayed refresh';
    case ConnectionPhase.CONNECTING:
      return 'Connecting';
    default:
      return isStale ? 'Data delayed' : 'Service degraded';
  }
}

/**
 * Dumb diagnostic badge. All state arrives via `input()`; the only side effect it can request
 * is a manual refresh (`refreshRequested`).
 */
@Component({
  selector: 'aoms-system-health-indicator',
  templateUrl: './system-health-indicator.component.html',
  styleUrl: './system-health-indicator.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'onEscape()',
    '(document:pointerdown)': 'onDocumentPointerDown($event)',
  },
})
export class SystemHealthIndicatorComponent {
  readonly health = input.required<GlobalSystemHealth>();
  readonly connection = input.required<ConnectionStatus>();
  readonly recovery = input.required<ConnectionRecoveryIndicator>();
  readonly isTelemetryStale = input(false);
  readonly lastSyncedAt = input<EpochMillis | null>(null);
  readonly isRefreshing = input(false);

  readonly refreshRequested = output<void>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly triggerRef = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');

  protected readonly panelId = `aoms-health-panel-${nextHealthInstanceId++}`;
  protected readonly isOpen = signal(false);

  protected readonly diagnostic = computed<HealthDiagnostic>(() => {
    const health = this.health();
    const connection = this.connection();
    const stale = this.isTelemetryStale();

    const link = describeLink(connection, stale);
    const domains = Object.values(health.domainGateways);
    const operationalDomains = domains.filter((d) => d.status === ServiceStatus.OPERATIONAL).length;

    const rows: readonly HealthDiagnosticRow[] = [
      { id: 'link', label: 'Backend link', status: link.status, reading: link.reading },
      {
        id: 'stream',
        label: 'Telemetry stream',
        status: budgetedStatus(health.webSocketStream),
        reading: readLatency(health.webSocketStream.latencyMs),
      },
      {
        id: 'api',
        label: 'API gateway',
        status: budgetedStatus(health.apiGateway),
        reading: readLatency(health.apiGateway.latencyMs),
      },
      {
        id: 'db',
        label: 'Database',
        status: budgetedStatus(health.database),
        reading: readLatency(health.database.latencyMs),
      },
      { id: 'occ', label: 'OCC server', status: health.occServer.status, reading: STATUS_WORD[health.occServer.status] },
      {
        id: 'domains',
        label: 'Domain gateways',
        status: worstOf(domains.map((d) => d.status)),
        reading: `${operationalDomains} of ${domains.length} operational`,
      },
    ];

    const worst = worstOf(rows.map((r) => r.status));
    const tone: HealthTone =
      worst === ServiceStatus.DOWN ? 'CRITICAL' : worst === ServiceStatus.DEGRADED ? 'DEGRADED' : 'OPTIMAL';

    return {
      tone,
      label: pillLabel(tone, connection, stale),
      apiLatencyMs: health.apiGateway.latencyMs,
      rows,
    };
  });

  protected readonly latencyText = computed(() => {
    const ms = this.diagnostic().apiLatencyMs;
    return ms === null ? null : `${Math.round(ms)} ms`;
  });

  protected readonly lastConfirmedText = computed(() => {
    const at = this.lastSyncedAt();
    return at === null ? 'No data received yet' : `Last confirmed ${formatZuluClock(at)}`;
  });

  protected readonly liveRegionPoliteness = computed(() =>
    this.diagnostic().tone === 'CRITICAL' ? 'assertive' : 'polite',
  );

  protected statusWord(status: ServiceStatus): string {
    return STATUS_WORD[status];
  }

  protected toggle(): void {
    this.isOpen.update((open) => !open);
  }

  protected requestRefresh(): void {
    this.refreshRequested.emit();
  }

  /** Host-bound handlers must be public. */
  onEscape(): void {
    if (!this.isOpen()) return;
    this.isOpen.set(false);
    this.triggerRef().nativeElement.focus();
  }

  onDocumentPointerDown(event: PointerEvent): void {
    if (this.isOpen() && event.target instanceof Node && !this.host.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }
}