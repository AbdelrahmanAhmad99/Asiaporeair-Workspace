
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IRouteDetailDto } from '@shared-core';

@Component({
  selector: 'aoms-route-connection-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './route-connection-card.component.html',
  styleUrl: './route-connection-card.component.scss',
})
export class RouteConnectionCardComponent {
  // ── Signal Inputs ─────────────────────────────────────────────────────
  readonly route = input.required<IRouteDetailDto>();
  readonly flightTime = input<string | null>(null);
  readonly distanceNm = input<number | null>(null);
  readonly codeshareCount = input<number>(0);

  // ── Derived ────────────────────────────────────────────────────────────
  readonly totalOperators = computed<number>(() => this.route().operators.length);
  readonly activeOperators = computed<number>(() =>
    this.route().operators.filter(o => o.isActive).length
  );
}