// seat-assignment-display.component.ts
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IBookingPassengerDetailDto } from '@shared-core';

@Component({
  selector: 'app-seat-assignment-display',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './seat-assignment-display.component.html',
  styleUrls: ['./seat-assignment-display.component.scss']
})
export class SeatAssignmentDisplayComponent {
  @Input({ required: true }) passengers!: IBookingPassengerDetailDto[];

  get seatedPassengers() {
    return this.passengers.filter(p => !!p.assignedSeatNumber);
  }

  getSeatRow(seatNumber: string): string {
    return seatNumber.replace(/\D/g, '');
  }

  getSeatLetter(seatNumber: string): string {
    return seatNumber.replace(/\d/g, '').toUpperCase();
  }

  isWindowSeat(letter: string): boolean {
    return ['A', 'F', 'K'].includes(letter.toUpperCase());
  }

  isAisleSeat(letter: string): boolean {
    return ['C', 'D', 'G', 'H'].includes(letter.toUpperCase());
  }

  trackByPax(_: number, p: IBookingPassengerDetailDto): number { return p.passengerId; }
}