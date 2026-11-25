
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
import { IArchivedAircraftDto } from '../../store/fleet-inventory.store';
import { RestoreOperationButtonComponent } from '../restore-operation-button/restore-operation-button.component';

// ── Staggered entry animation ─────────────────────────────────────────────
export const archiveRowAnimation = trigger('archiveRows', [
    transition('* => *', [
        query(':enter', [
            style({ opacity: 0, transform: 'scale(0.97) translateY(5px)' }),
            stagger(30, [
                animate(
                    '250ms cubic-bezier(0.4, 0, 0.2, 1)',
                    style({ opacity: 1, transform: 'scale(1) translateY(0)' })
                ),
            ]),
        ], { optional: true }),
    ]),
]);

@Component({
    selector: 'aoms-aircraft-audit-log-table',
    standalone: true,
    imports: [CommonModule, RestoreOperationButtonComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [archiveRowAnimation],
    templateUrl: './aircraft-audit-log-table.component.html',
    styleUrl: './aircraft-audit-log-table.component.scss',
})
export class AircraftAuditLogTableComponent {
    // ── Inputs ──────────────────────────────────────────────────────────────
    readonly records = input.required<IArchivedAircraftDto[]>();
    readonly loading = input<boolean>(false);
    readonly restoringTail = input<string | null>(null);
    readonly restoredTail = input<string | null>(null);

    // ── Outputs ─────────────────────────────────────────────────────────────
    readonly restoreTriggered = output<string>(); // tailNumber

    protected readonly shimmerRows = Array(6).fill(null);

    // ── Helpers ───────────────────────────────────────────────────────────
    protected formatDate(iso: string | Date | undefined): string {
        if (!iso) return '—';
        return new Date(iso).toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric',
        });
    }

    protected formatHours(hours: number | undefined): string {
        if (hours == null) return '—';
        return hours >= 1000
            ? `${(hours / 1000).toFixed(1)}k hrs`
            : `${hours} hrs`;
    }

    protected truncateReason(reason: string | undefined, max = 40): string {
        if (!reason) return '—';
        return reason.length > max ? reason.slice(0, max) + '…' : reason;
    }

    protected isRowRestoring(tail: string): boolean {
        return this.restoringTail() === tail;
    }

    protected isRowRestored(tail: string): boolean {
        return this.restoredTail() === tail;
    }
}