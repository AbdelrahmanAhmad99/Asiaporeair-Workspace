// ============================================================================
// passenger-seat-selector.component.ts
// Asiaporeair | Dumb — Passenger list for seat selection
// ============================================================================

import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface IPassengerSeatEntry {
  passengerId: number;
  label: string;
  seatNumber: string;
  isAssigning: boolean;
}

@Component({
  selector: 'app-passenger-seat-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './passenger-seat-selector.component.html',
  styleUrls: ['./passenger-seat-selector.component.scss']
})
export class PassengerSeatSelectorComponent {

  // ── Inputs ────────────────────────────────────────────────────────────────
  readonly passengers = input<IPassengerSeatEntry[]>([]);
  readonly activePassengerId = input<number | null>(null);

  // ── Outputs ───────────────────────────────────────────────────────────────
  readonly passengerSelect = output<number>();
  readonly changeSeat = output<number>();

  onSelect(passengerId: number): void {
    this.passengerSelect.emit(passengerId);
  }

  onChangeSeat(event: Event, passengerId: number): void {
    event.stopPropagation();
    this.changeSeat.emit(passengerId);
  }

  trackByPax(_: number, p: IPassengerSeatEntry): number { return p.passengerId; }
}