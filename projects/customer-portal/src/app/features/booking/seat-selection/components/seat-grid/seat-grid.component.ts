// ============================================================================
// seat-grid.component.ts
// Asiaporeair | Dumb — Aircraft cabin seat grid renderer
// ============================================================================

import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { ICabinSeatLayoutDto, ISeatDto } from '@shared-core';
import { IPassengerSeatAssignment } from '../../../store/booking.store';
import { SeatItemComponent } from '../seat-item/seat-item.component';

// ── Internal Row Model ────────────────────────────────────────────────────────
export interface ISeatRow {
  rowNumber: number;
  seats: (ISeatDto | null)[]; // null = aisle gap
  isExitRow: boolean;
  hasBassinet: boolean;
}

@Component({
  selector: 'app-seat-grid',
  standalone: true,
  imports: [CommonModule, SeatItemComponent],
  animations: [
    trigger('rowsIn', [
      transition(':enter', [
        query('.seat-row', [
          style({ opacity: 0, transform: 'translateY(10px)' }),
          stagger(14, [
            animate('240ms cubic-bezier(0.16,1,0.3,1)',
              style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ],
  templateUrl: './seat-grid.component.html',
  styleUrls: ['./seat-grid.component.scss']
})
export class SeatGridComponent {

  // ── Inputs ────────────────────────────────────────────────────────────────
  readonly cabin = input.required<ICabinSeatLayoutDto>();
  readonly availableSeatIds = input<Set<string>>(new Set());
  readonly activePassengerId = input<number | null>(null);
  readonly seatAssignments = input<IPassengerSeatAssignment[]>([]);
  readonly hoveredSeatId = input<string | null>(null);
  readonly popoverSeat = input<ISeatDto | null>(null);
  readonly currency = input<string>('SGD');

  // ── Outputs ───────────────────────────────────────────────────────────────
  readonly seatClick = output<ISeatDto>();
  readonly seatHover = output<ISeatDto | null>();
  readonly confirmSeat = output<ISeatDto>();
  readonly closePopover = output<void>();

  // ── Computed ──────────────────────────────────────────────────────────────

  /** Parse seat numbers → row number → sorted rows with aisle gap inserted. */
  readonly rows = computed((): ISeatRow[] => {
    const seats = this.cabin().seats;
    if (!seats?.length) return [];

    // Group by row number (leading digits of seatNumber e.g. "32E" → 32)
    const rowMap = new Map<number, ISeatDto[]>();
    for (const seat of seats) {
      const rowNum = parseInt(seat.seatNumber.replace(/\D/g, ''), 10);
      if (!rowMap.has(rowNum)) rowMap.set(rowNum, []);
      rowMap.get(rowNum)!.push(seat);
    }

    // Determine column letters for the cabin (derive from data)
    const allCols = [...new Set(
      seats.map(s => s.seatNumber.replace(/\d/g, ''))
    )].sort();

    // Determine aisle position: insert null between groups
    // Standard: ABC | aisle | DEF or ABCDEF with aisle after C/before D
    const aisleAfter = this.detectAislePosition(allCols);

    const sortedRows = [...rowMap.keys()].sort((a, b) => a - b);

    return sortedRows.map(rowNum => {
      const rowSeats = rowMap.get(rowNum)!;
      const seatsInOrder = this.buildRowWithAisle(rowSeats, allCols, aisleAfter);
      const isExitRow = rowSeats.some(s => s.isExitRow);
      return {
        rowNumber: rowNum,
        seats: seatsInOrder,
        isExitRow,
        hasBassinet: false // extend if API provides this flag
      };
    });
  });

  /** Column headers (letters only, with null for aisle gap) */
  readonly columnHeaders = computed((): (string | null)[] => {
    const seats = this.cabin().seats;
    if (!seats?.length) return [];
    const allCols = [...new Set(seats.map(s => s.seatNumber.replace(/\d/g, '')))].sort();
    const aisleAfter = this.detectAislePosition(allCols);
    const headers: (string | null)[] = [];
    allCols.forEach((col, i) => {
      headers.push(col);
      if (i === aisleAfter) headers.push(null); // aisle
    });
    return headers;
  });

  // ── Helpers ───────────────────────────────────────────────────────────────

  private detectAislePosition(cols: string[]): number {
    // For 3+3 (ABC DEF) → aisle after C (index 2)
    // For 2+4+2 wide-bodies → after B, after E
    // Simple heuristic: aisle at half - 1
    return Math.floor(cols.length / 2) - 1;
  }

  private buildRowWithAisle(
    rowSeats: ISeatDto[], allCols: string[], aisleAfter: number
  ): (ISeatDto | null)[] {
    const seatByCols = new Map<string, ISeatDto>();
    rowSeats.forEach(s => {
      const col = s.seatNumber.replace(/\d/g, '');
      seatByCols.set(col, s);
    });

    const result: (ISeatDto | null)[] = [];
    allCols.forEach((col, i) => {
      result.push(seatByCols.get(col) ?? null);
      if (i === aisleAfter) result.push(null); // aisle spacer
    });
    return result;
  }

  // ── Template Helpers ──────────────────────────────────────────────────────

  getSeatState(seat: ISeatDto): 'available' | 'occupied' | 'selected-active' | 'selected-other' | 'exit' {
    const isAvailable = this.availableSeatIds().has(seat.seatId);
    if (!seat.isAvailable || !isAvailable) return 'occupied';

    const activeId = this.activePassengerId();
    const assignments = this.seatAssignments();

    // Selected by the currently active passenger
    if (activeId != null && assignments.find(a => a.passengerId === activeId && a.seatId === seat.seatId)) {
      return 'selected-active';
    }
    // Selected by another passenger
    if (assignments.find(a => a.seatId === seat.seatId)) {
      return 'selected-other';
    }

    return 'available';
  }

  getPassengerIndexForSeat(seatId: string): number | null {
    const found = this.seatAssignments().find(a => a.seatId === seatId);
    return found?.passengerIndex ?? null;
  }

  formatPrice(amount: number | null | undefined): string {
    if (amount == null || amount === 0) return 'Free';
    return `${this.currency()} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  }

  trackByRow(_: number, row: ISeatRow): number { return row.rowNumber; }
  trackBySeat(i: number, s: ISeatDto | null): string { return s?.seatId ?? `null-${i}`; }
}