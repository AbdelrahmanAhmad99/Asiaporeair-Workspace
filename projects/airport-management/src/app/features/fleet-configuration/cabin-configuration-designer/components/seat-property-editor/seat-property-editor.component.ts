

import {
    ChangeDetectionStrategy,
    Component,
    effect,
    input,
    output,
    signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ISeatViewModel } from '../../store/cabin-designer.store';

export interface ISeatSpecUpdate {
    seatId: string;
    isWindow: boolean;
    isExitRow: boolean;
    isAisle: boolean;
    cabinClassId: number;
}

@Component({
    selector: 'aoms-seat-property-editor',
    standalone: true,
    imports: [CommonModule, FormsModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './seat-property-editor.component.html',
    styleUrl: './seat-property-editor.component.scss',
})
export class SeatPropertyEditorComponent {
    // ── Inputs ──────────────────────────────────────────────────────────────
    readonly seat = input<ISeatViewModel | null>(null);
    readonly isProcessing = input<boolean>(false);
    readonly saveError = input<string | null>(null);
    readonly saveSuccess = input<string | null>(null);

    // ── Outputs ─────────────────────────────────────────────────────────────
    readonly specsApplied = output<ISeatSpecUpdate>();
    readonly deleteSeat = output<string>();    // seatId
    readonly panelClosed = output<void>();

    // ── Local Edit State ──────────────────────────────────────────────────
    protected isWindow = signal<boolean>(false);
    protected isExitRow = signal<boolean>(false);
    protected isAisle = signal<boolean>(false);
    protected isDirty = signal<boolean>(false);

    constructor() {
        // Sync local state when the selected seat changes
        effect(() => {
            const s = this.seat();
            if (s) {
                this.isWindow.set(s.isWindow);
                this.isExitRow.set(s.isExitRow);
                this.isAisle.set(s.isAisle);
                this.isDirty.set(false);
            }
        });
    }

    protected onToggle(field: 'isWindow' | 'isExitRow' | 'isAisle', value: boolean): void {
        if (field === 'isWindow') this.isWindow.set(value);
        if (field === 'isExitRow') this.isExitRow.set(value);
        if (field === 'isAisle') this.isAisle.set(value);
        this.isDirty.set(true);
        // Auto-save on toggle
        this.emitUpdate();
    }

    protected emitUpdate(): void {
        const s = this.seat();
        if (!s) return;
        this.specsApplied.emit({
            seatId: s.seatId,
            isWindow: this.isWindow(),
            isExitRow: this.isExitRow(),
            isAisle: this.isAisle(),
            cabinClassId: s.cabinClassId,
        });
        this.isDirty.set(false);
    }

    protected onDeleteClicked(): void {
        const s = this.seat();
        if (s) this.deleteSeat.emit(s.seatId);
    }
}