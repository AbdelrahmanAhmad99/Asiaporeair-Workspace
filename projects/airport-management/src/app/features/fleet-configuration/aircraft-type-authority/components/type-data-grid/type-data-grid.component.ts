
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
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

// ── Animation Definition ─────────────────────────────────────────────────
export const gridRowAnimation = trigger('gridAnimation', [
  transition('* => *', [
    query(
      ':enter',
      [
        style({ opacity: 0, transform: 'translateY(8px)' }),
        stagger(30, [
          animate(
            '220ms cubic-bezier(0.4, 0, 0.2, 1)',
            style({ opacity: 1, transform: 'translateY(0)' })
          ),
        ]),
      ],
      { optional: true }
    ),
  ]),
]);

// ── Action Event Types ────────────────────────────────────────────────────
export type GridAction = 'view' | 'edit' | 'archive' | 'reactivate';

export interface IGridActionEvent {
  action: GridAction;
  typeId: number;
}

// ── Column Definition ─────────────────────────────────────────────────────
interface IGridColumn {
  key: string;
  label: string;
  shimmerWidth: string;
  hideOnMd?: boolean;
  hideOnLg?: boolean;
}

@Component({
  selector: 'aoms-type-data-grid',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [gridRowAnimation],
  templateUrl: './type-data-grid.component.html',
  styleUrl: './type-data-grid.component.scss',
})
export class TypeDataGridComponent {
  // ── Inputs ──────────────────────────────────────────────────────────────
  readonly aircraftTypes = input.required<IAircraftTypeDto[]>();
  readonly loading = input<boolean>(false);

  // ── Outputs ─────────────────────────────────────────────────────────────
  readonly actionTriggered = output<IGridActionEvent>();

  // ── Column Definitions ────────────────────────────────────────────────
  protected readonly columns: IGridColumn[] = [
    { key: 'manufacturer', label: 'Manufacturer', shimmerWidth: '60%' },
    { key: 'model', label: 'Model', shimmerWidth: '70%' },
    { key: 'rangeKm', label: 'Max Range', shimmerWidth: '55px' },
    { key: 'maxSeats', label: 'Seating Cap.', shimmerWidth: '45px', hideOnMd: true },
    { key: 'cargoCapacity', label: 'Cargo (m³)', shimmerWidth: '45px', hideOnLg: true },
    { key: 'velocity', label: 'Cruising Speed', shimmerWidth: '50px', hideOnLg: true },
    { key: 'actions', label: 'Actions', shimmerWidth: '90px' },
  ];

  protected readonly shimmerRows = Array(8).fill(null);

  // ── Helpers ───────────────────────────────────────────────────────────
  protected formatRange(km: number | undefined): string {
    if (km == null) return '—';
    return km >= 1000 ? `${(km / 1000).toFixed(1)}k km` : `${km} km`;
  }

  protected formatVelocity(kph: number | undefined): string {
    if (kph == null) return '—';
    return `${kph} km/h`;
  }

  protected onAction(action: GridAction, typeId: number): void {
    this.actionTriggered.emit({ action, typeId });
  }
}