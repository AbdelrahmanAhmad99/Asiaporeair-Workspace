
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

const auditRowAnim = trigger('auditRows', [
  transition('* => *', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateX(-8px)' }),
      stagger(25, [
        animate('220ms cubic-bezier(0.22, 1, 0.36, 1)',
          style({ opacity: 1, transform: 'translateX(0)' })),
      ]),
    ], { optional: true }),
    // Luxury Fade — 400ms per spec
    query(':leave', [
      animate('400ms cubic-bezier(0.4, 0, 0.2, 1)',
        style({ opacity: 0, transform: 'translateX(12px)', maxHeight: '0' })),
    ], { optional: true }),
  ]),
]);

interface IColumn { key: string; label: string; shimmerWidth: string; hideMd?: boolean; hideLg?: boolean; }

@Component({
  selector: 'aoms-route-audit-table',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [auditRowAnim],
  templateUrl: './route-audit-table.component.html',
  styleUrl: './route-audit-table.component.scss',
})
export class RouteAuditTableComponent {
  // ── Inputs ─────────────────────────────────────────────────────────────
  readonly routes = input.required<IRouteDto[]>();
  readonly loading = input<boolean>(false);
  readonly restoringId = input<number | null>(null);
  readonly isProcessing = input<boolean>(false);

  // ── Output ────────────────────────────────────────────────────────────
  readonly onRestore = output<number>();

  // ── Columns ────────────────────────────────────────────────────────────
  protected readonly columns: IColumn[] = [
    { key: 'id', label: 'ID', shimmerWidth: '36px', hideLg: true },
    { key: 'origin', label: 'Origin Hub', shimmerWidth: '56px' },
    { key: 'arrow', label: '', shimmerWidth: '20px' },
    { key: 'dest', label: 'Dest. Hub', shimmerWidth: '56px' },
    { key: 'dist', label: 'Distance', shimmerWidth: '48px', hideMd: true },
    { key: 'cities', label: 'Corridors', shimmerWidth: '45%', hideMd: true },
    { key: 'status', label: 'Status', shimmerWidth: '52px' },
    { key: 'action', label: '', shimmerWidth: '64px' },
  ];

  protected readonly shimmerRows = Array(6).fill(null);

  protected isRestoring(id: number): boolean {
    return this.restoringId() === id;
  }

  protected formatDistance(km: number): string {
    return `${km.toLocaleString()} km`;
  }

  protected corridorLabel(r: IRouteDto): string {
    return `${r.originCity} → ${r.destinationCity}`;
  }
}