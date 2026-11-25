
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IRouteDto } from '@shared-core';

@Component({
  selector: 'aoms-related-routes-panel',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './related-routes-panel.component.html',
  styleUrl: './related-routes-panel.component.scss',
})
export class RelatedRoutesPanelComponent {
  // ── Inputs ────────────────────────────────────────────────────────────
  readonly originRoutes = input<IRouteDto[]>([]);
  readonly destRoutes = input<IRouteDto[]>([]);
  readonly currentRouteId = input.required<number>();
  readonly currentOrigin = input<string>('');
  readonly currentDest = input<string>('');
  readonly loading = input<boolean>(false);

  // ── Output ────────────────────────────────────────────────────────────
  readonly analyzeRoute = output<number>();

  // ── Filtered lists (exclude the current route) ─────────────────────────
  readonly filteredOrigin = computed<IRouteDto[]>(() =>
    this.originRoutes().filter(r => r.routeId !== this.currentRouteId())
  );

  readonly filteredDest = computed<IRouteDto[]>(() =>
    this.destRoutes().filter(r => r.routeId !== this.currentRouteId())
  );

  readonly shimmerRows = Array(5).fill(null);

  protected formatDistance(km: number): string {
    return `${km.toLocaleString()} km`;
  }
}