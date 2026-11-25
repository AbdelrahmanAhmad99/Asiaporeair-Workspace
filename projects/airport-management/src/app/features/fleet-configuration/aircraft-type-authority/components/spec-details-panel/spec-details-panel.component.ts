
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  animate,
  query,
  stagger,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { IAircraftTypeDto } from '@shared-core';

// ── Staggered card entry animation ───────────────────────────────────────
export const specCardAnimation = trigger('specCards', [
  transition(':enter', [
    query('.spec-group', [
      style({ opacity: 0, transform: 'translateY(12px)' }),
      stagger(70, [
        animate(
          '300ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
    ], { optional: true }),
  ]),
]);

// ── Spec item model ───────────────────────────────────────────────────────
interface ISpecItem {
  label: string;
  valuePrimary: string;
  valueSecondary?: string;
  iconPath: string;
  isEmpty: boolean;
}

// ── Spec group model ──────────────────────────────────────────────────────
interface ISpecGroup {
  id: string;
  title: string;
  iconPath: string;
  items: ISpecItem[];
}

@Component({
  selector: 'aoms-spec-details-panel',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [specCardAnimation],
  templateUrl: './spec-details-panel.component.html',
  styleUrl: './spec-details-panel.component.scss',
})
export class SpecDetailsPanelComponent {
  // ── Inputs ──────────────────────────────────────────────────────────────
  readonly aircraftType = input<IAircraftTypeDto | null>(null);
  readonly loading = input<boolean>(false);
  readonly revision = input<number>(0);

  // ── Shimmer placeholder rows ──────────────────────────────────────────
  protected readonly shimmerGroups = Array(3).fill(null);
  protected readonly shimmerItems = Array(3).fill(null);

  // ── Conversion helpers (pure functions) ──────────────────────────────
  private _kmToMiles(km: number) { return Math.round(km * 0.621371); }
  private _kmhToKnots(kmh: number) { return Math.round(kmh * 0.539957); }
  private _m3ToCuFt(m3: number) { return Math.round(m3 * 35.3147); }

  // ── Spec Groups — computed from input signal ──────────────────────────
  readonly specGroups = computed<ISpecGroup[]>(() => {
    const t = this.aircraftType();

    // ── Performance group ───────────────────────────────────────────────
    const performance: ISpecGroup = {
      id: 'performance',
      title: 'Performance',
      iconPath: 'M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12zm0 0h7.5',
      items: [
        {
          label: 'Maximum Range',
          valuePrimary: t?.rangeKm != null ? `${t.rangeKm.toLocaleString()} km` : '—',
          valueSecondary: t?.rangeKm != null ? `${this._kmToMiles(t.rangeKm).toLocaleString()} mi` : undefined,
          iconPath: 'M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z',
          isEmpty: t?.rangeKm == null,
        },
        {
          label: 'Cruising Speed',
          valuePrimary: t?.cruisingVelocity != null ? `${t.cruisingVelocity.toLocaleString()} km/h` : '—',
          valueSecondary: t?.cruisingVelocity != null ? `${this._kmhToKnots(t.cruisingVelocity)} kts` : undefined,
          iconPath: 'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z',
          isEmpty: t?.cruisingVelocity == null,
        },
      ],
    };

    // ── Capacity group ──────────────────────────────────────────────────
    const capacity: ISpecGroup = {
      id: 'capacity',
      title: 'Capacity',
      iconPath: 'M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0zM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632z',
      items: [
        {
          label: 'Maximum Seating',
          valuePrimary: t?.maxSeats != null ? `${t.maxSeats.toLocaleString()} seats` : '—',
          iconPath: 'M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0zM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632z',
          isEmpty: t?.maxSeats == null,
        },
        {
          label: 'Cargo Volume',
          valuePrimary: t?.cargoCapacity != null ? `${t.cargoCapacity.toLocaleString()} m³` : '—',
          valueSecondary: t?.cargoCapacity != null ? `${this._m3ToCuFt(t.cargoCapacity).toLocaleString()} cu ft` : undefined,
          iconPath: 'M20.25 7.5l-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z',
          isEmpty: t?.cargoCapacity == null,
        },
      ],
    };

    // ── Classification group ────────────────────────────────────────────
    const classification: ISpecGroup = {
      id: 'classification',
      title: 'Classification',
      iconPath: 'M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776',
      items: [
        {
          label: 'Manufacturer',
          valuePrimary: t?.manufacturer ?? '—',
          iconPath: 'M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21',
          isEmpty: !t?.manufacturer,
        },
        {
          label: 'Aircraft Model',
          valuePrimary: t?.model ?? '—',
          iconPath: 'M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12zm0 0h7.5',
          isEmpty: !t?.model,
        },
      ],
    };

    return [performance, capacity, classification];
  });
}