
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    input,
    output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ISeatViewModel, SeatEditState } from '../../store/cabin-designer.store';
import { CabinClassType } from '../../store/cabin-designer.store';

@Component({
    selector: 'aoms-seat-unit',
    standalone: true,
    imports: [CommonModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './seat-unit.component.html',
    styleUrl: './seat-unit.component.scss',
})
export class SeatUnitComponent {
    // ── Inputs ──────────────────────────────────────────────────────────────
    readonly seat = input<ISeatViewModel | null>(null);
    readonly cabinType = input<CabinClassType>('economy');
    readonly isSelected = input<boolean>(false);
    /** True when hovering over this seat in the grid */
    readonly isHovered = input<boolean>(false);

    // ── Output ──────────────────────────────────────────────────────────────
    readonly seatClicked = output<ISeatViewModel>();
    readonly seatHovered = output<ISeatViewModel | null>();

    // ── Computed ──────────────────────────────────────────────────────────────
    protected readonly effectiveState = computed<SeatEditState>(() => {
        if (this.isSelected()) return 'selected';
        return this.seat()?.editState ?? 'default';
    });

    protected readonly isInteractable = computed(() => {
        const s = this.effectiveState();
        return s !== 'pending-delete';
    });

    protected readonly sizeClass = computed<string>(() => {
        const t = this.cabinType();
        if (t === 'suites' || t === 'first') return 'seat-unit--xl';
        if (t === 'business') return 'seat-unit--lg';
        if (t === 'premium-economy') return 'seat-unit--md';
        return 'seat-unit--sm';
    });

    protected readonly ariaLabel = computed(() => {
        const s = this.seat();
        if (!s) return 'Empty position — click to add seat';
        const attrs: string[] = [];
        if (s.isWindow) attrs.push('window');
        if (s.isAisle) attrs.push('aisle');
        if (s.isExitRow) attrs.push('exit row');
        const state = this.effectiveState();
        const stateLabel = state === 'selected' ? ', selected for editing' : '';
        return `Seat ${s.seatNumber}${attrs.length ? ', ' + attrs.join(', ') : ''}${stateLabel}`;
    });

    onKeydown(event: KeyboardEvent): void {
        if (!this.isInteractable()) return;
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            const s = this.seat();
            if (s) this.seatClicked.emit(s);
        }
    }
}