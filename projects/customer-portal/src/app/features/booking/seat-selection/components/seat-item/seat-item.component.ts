// ============================================================================
// seat-item.component.ts
// Asiaporeair | Dumb — Individual seat button with state rendering
// ============================================================================

import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ISeatDto } from '@shared-core';

export type SeatState = 'available' | 'occupied' | 'selected-active' | 'selected-other' | 'exit';

@Component({
  selector: 'app-seat-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './seat-item.component.html',
  styleUrls: ['./seat-item.component.scss']
})
export class SeatItemComponent {

  // ── Inputs ────────────────────────────────────────────────────────────────
  readonly seat = input.required<ISeatDto>();
  readonly state = input<SeatState>('available');
  readonly isHovered = input<boolean>(false);
  readonly passengerIndex = input<number | null>(null);
  readonly currency = input<string>('SGD');

  // ── Outputs ───────────────────────────────────────────────────────────────
  readonly seatClick = output<void>();
  readonly seatHover = output<boolean>();

  // ── Computed ──────────────────────────────────────────────────────────────
  readonly isInteractable = computed(() =>
    this.state() === 'available' ||
    this.state() === 'selected-active' ||
    this.state() === 'selected-other'
  );

  readonly ariaLabel = computed(() => {
    const s = this.seat();
    const st = this.state();
    const pax = this.passengerIndex();
    if (st === 'occupied') return `Seat ${s.seatNumber}, unavailable`;
    if (st === 'selected-active') return `Seat ${s.seatNumber}, selected for current passenger`;
    if (st === 'selected-other' && pax != null) return `Seat ${s.seatNumber}, selected for passenger ${pax + 1}`;
    const extras: string[] = [];
    if (s.isWindow) extras.push('window');
    if (s.isAisle) extras.push('aisle');
    if (s.isExitRow) extras.push('exit row');
    const priceStr = s.seatPrice ? `, ${this.currency()} ${s.seatPrice}` : ', complimentary';
    return `Seat ${s.seatNumber}${extras.length ? ', ' + extras.join(', ') : ''}${priceStr}. Click to select.`;
  });

  onKeydown(event: KeyboardEvent): void {
    if (!this.isInteractable()) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.seatClick.emit();
    }
  }
}