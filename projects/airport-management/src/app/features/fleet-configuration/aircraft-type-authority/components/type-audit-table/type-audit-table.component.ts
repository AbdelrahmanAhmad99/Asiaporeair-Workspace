
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
  state,
} from '@angular/animations';
import { IAircraftTypeAuditDto } from '../../store/aircraft-types.store';
import { RestoreActionCellComponent } from '../restore-action-cell/restore-action-cell.component';

// ── Faded-slide-down restore animation ───────────────────────────────────
export const auditRowAnimation = trigger('auditRows', [
  transition('* => *', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(-6px)' }),
      stagger(30, [
        animate(
          '280ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
    ], { optional: true }),
  ]),
]);

// Trigger on a single restored row — slide down and fade in (re-enter active)
export const restoredRowAnimation = trigger('restoredRow', [
  state('archived', style({ opacity: 1 })),
  state('active', style({ opacity: 1 })),
  transition('archived => active', [
    animate('500ms cubic-bezier(0.4, 0, 0.2, 1)',
      style({ background: 'rgba(6, 78, 59, 0.08)' })
    ),
  ]),
]);

// ── Column definition ─────────────────────────────────────────────────────
interface IAuditColumn {
  key: string;
  label: string;
  shimmerWidth: string;
  hideOnMd?: boolean;
  hideOnLg?: boolean;
}

@Component({
  selector: 'aoms-type-audit-table',
  standalone: true,
  imports: [CommonModule, RestoreActionCellComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [auditRowAnimation, restoredRowAnimation],
  templateUrl: './type-audit-table.component.html',
  styleUrl: './type-audit-table.component.scss',
})
export class TypeAuditTableComponent {
  // ── Inputs ──────────────────────────────────────────────────────────────
  readonly records = input.required<IAircraftTypeAuditDto[]>();
  readonly loading = input<boolean>(false);
  readonly restoringId = input<number | null>(null);  // typeId being restored right now

  // ── Outputs ─────────────────────────────────────────────────────────────
  readonly restoreTriggered = output<number>();  // typeId

  // ── Column definitions ────────────────────────────────────────────────
  protected readonly columns: IAuditColumn[] = [
    { key: 'status', label: 'Status', shimmerWidth: '60px' },
    { key: 'model', label: 'Model', shimmerWidth: '70%' },
    { key: 'mfr', label: 'Manufacturer', shimmerWidth: '60%' },
    { key: 'updatedAt', label: 'Last Modified', shimmerWidth: '80px', hideOnMd: true },
    { key: 'deletedAt', label: 'Archived On', shimmerWidth: '80px', hideOnLg: true },
    { key: 'deletedBy', label: 'Archived By', shimmerWidth: '70px', hideOnLg: true },
    { key: 'reason', label: 'Reason', shimmerWidth: '60%', hideOnLg: true },
    { key: 'actions', label: 'Actions', shimmerWidth: '140px' },
  ];

  protected readonly shimmerRows = Array(7).fill(null);

  // ── Helpers ───────────────────────────────────────────────────────────
  protected formatDate(iso: string | undefined): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  }

  protected truncateReason(reason: string | undefined, max = 38): string {
    if (!reason) return '—';
    return reason.length > max ? reason.slice(0, max) + '…' : reason;
  }

  protected isRestoringRow(typeId: number): boolean {
    return this.restoringId() === typeId;
  }
}