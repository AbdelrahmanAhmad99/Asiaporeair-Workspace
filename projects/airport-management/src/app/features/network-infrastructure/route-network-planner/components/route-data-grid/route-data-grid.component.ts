
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
import { IRouteDto } from '@shared-core';

export const routeGridAnimation = trigger('routeGridAnim', [
  transition('* => *', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(6px)' }),
      stagger(28, [
        animate('220ms cubic-bezier(0.22, 1, 0.36, 1)',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
    ], { optional: true }),
  ]),
]);

interface IGridColumn {
  key: string;
  label: string;
  shimmerWidth: string;
  hideOnMd?: boolean;
  hideOnLg?: boolean;
}

@Component({
  selector: 'aoms-route-data-grid',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [routeGridAnimation],
  templateUrl: './route-data-grid.component.html',
  styleUrl: './route-data-grid.component.scss',
})
export class RouteDataGridComponent {
  // ── Inputs ─────────────────────────────────────────────────────────────
  readonly routes = input.required<IRouteDto[]>();
  readonly loading = input<boolean>(false);
  readonly recordLabel = input<string>('');

  // ── Outputs ────────────────────────────────────────────────────────────
  readonly onAnalyze = output<number>();
  readonly onModify = output<number>();
  readonly onDeactivate = output<number>();

  // ── Columns ────────────────────────────────────────────────────────────
  protected readonly columns: IGridColumn[] = [
    { key: 'origin', label: 'Origin Hub', shimmerWidth: '60px' },
    { key: 'arrow', label: '', shimmerWidth: '20px' },
    { key: 'destination', label: 'Destination Hub', shimmerWidth: '60px' },
    { key: 'distance', label: 'Distance', shimmerWidth: '48px', hideOnMd: true },
    { key: 'routeId', label: 'Route ID', shimmerWidth: '40px', hideOnLg: true },
    { key: 'status', label: 'Status', shimmerWidth: '56px' },
    { key: 'actions', label: 'Actions', shimmerWidth: '80px' },
  ];

  protected readonly shimmerRows = Array(8).fill(null);

  protected formatDistance(km: number): string {
    if (!km) return '—';
    return `${km.toLocaleString()} km`;
  }
}