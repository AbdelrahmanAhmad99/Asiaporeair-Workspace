
import {
    ChangeDetectionStrategy,
    Component,
    input,
    output,
    signal,
    effect,
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
import {
    ISeatGridLayout,
    ISeatGridRow,
    ISeatViewModel,
} from '../../store/cabin-designer.store';
import { CabinClassType } from '../../store/cabin-designer.store';
import { SeatUnitComponent } from '../seat-unit/seat-unit.component';

// Staggered row entry matching CBES seat-grid 14ms stagger
export const gridRowAnimation = trigger('gridRows', [
    transition(':enter', [
        query('.vsg-row', [
            style({ opacity: 0, transform: 'translateY(10px)' }),
            stagger(14, [
                animate('240ms cubic-bezier(0.16,1,0.3,1)',
                    style({ opacity: 1, transform: 'translateY(0)' })
                ),
            ]),
        ], { optional: true }),
    ]),
]);

@Component({
    selector: 'aoms-visual-seat-grid',
    standalone: true,
    imports: [CommonModule, SeatUnitComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [gridRowAnimation],
    templateUrl: './visual-seat-grid.component.html',
    styleUrl: './visual-seat-grid.component.scss',
})
export class VisualSeatGridComponent {
    // ── Inputs ──────────────────────────────────────────────────────────────
    readonly layout = input.required<ISeatGridLayout>();
    readonly cabinType = input<CabinClassType>('economy');
    readonly selectedSeatId = input<string | null>(null);
    readonly hoveredSeatId = input<string | null>(null);
    readonly cabinName = input<string>('');

    // ── Manual Construction Wizard ──────────────────────────────────────────
    protected readonly availableCols = ['A', 'B', 'C', 'D', 'E', 'F', 'H', 'J', 'K'];
    protected readonly selectedCol = signal<string>('A');
    protected readonly selectedRow = signal<number>(1);

    constructor() {
        // Automatically suggest the current last row number to help user extend it
        effect(() => {
            const rows = this.layout().rows;
            if (rows.length > 0) {
                // If there are seats, default to the last row number for easy extension
                this.selectedRow.set(rows[rows.length - 1].rowNumber);
            }
        });
    }

    // ── Outputs ─────────────────────────────────────────────────────────────
    readonly seatSelected = output<ISeatViewModel>();
    readonly seatHovered = output<ISeatViewModel | null>();
    readonly emptyClicked = output<{ row: number; col: string }>();

    // ── Manual Actions ───────────────────────────────────────────────────
    protected onManualAdd(): void {
        this.emptyClicked.emit({
            row: this.selectedRow(),
            col: this.selectedCol()
        });
    }

    // ── Column headers with aisle gaps ────────────────────────────────────
    protected colHeaders(layout: ISeatGridLayout): (string | null)[] {
        const headers: (string | null)[] = [];
        layout.columnLetters.forEach((col, i) => {
            headers.push(col);
            if (layout.aisleAfterIndices.includes(i)) headers.push(null);
        });
        return headers;
    }

    // ── TrackBy helpers ───────────────────────────────────────────────────
    protected trackByRow(_: number, row: ISeatGridRow): number {
        return row.rowNumber;
    }

    protected trackByCell(i: number, cell: ISeatViewModel | null): string {
        return cell?.seatId ?? `empty-${i}`;
    }

    protected trackByHeader(i: number, col: string | null): string {
        return col ?? `aisle-${i}`;
    }

    // ── Event helpers ─────────────────────────────────────────────────────
    protected onSeatClicked(seat: ISeatViewModel): void {
        this.seatSelected.emit(seat);
    }

    protected onEmptyCellClicked(row: ISeatGridRow, colIndex: number): void {
        // Derive the column letter for this cell position
        const layout = this.layout();
        // Cell index in the row array, accounting for aisle gaps
        // Rebuild logical column index (skip null aisle spacers)
        let logicalIdx = 0;
        for (let i = 0; i <= colIndex && i < layout.columnLetters.length; i++) {
            if (!layout.aisleAfterIndices.includes(i - 1)) logicalIdx = i;
        }
        const col = layout.columnLetters[Math.min(colIndex, layout.columnLetters.length - 1)] ?? 'A';
        this.emptyClicked.emit({ row: row.rowNumber, col });
    }
}