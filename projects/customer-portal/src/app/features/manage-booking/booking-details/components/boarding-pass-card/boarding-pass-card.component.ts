// boarding-pass-card.component.ts
import { Component, Input, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IBookingDetailDto,
  IBookingPassengerDetailDto
} from '@shared-core';

@Component({
  selector: 'app-boarding-pass-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './boarding-pass-card.component.html',
  styleUrls: ['./boarding-pass-card.component.scss']
})
export class BoardingPassCardComponent {

  @Input({ required: true }) passenger!: IBookingPassengerDetailDto;
  @Input({ required: true }) detail!: IBookingDetailDto;

  get depTime(): string {
    if (!this.detail.flightDepartureTime) return '';
    return new Date(this.detail.flightDepartureTime)
      .toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit', hour12: false });
  }

  get depDate(): string {
    if (!this.detail.flightDepartureTime) return '';
    return new Date(this.detail.flightDepartureTime)
      .toLocaleDateString('en-SG', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  get fullName(): string {
    return `${this.passenger.lastName?.toUpperCase() ?? ''} / ${this.passenger.firstName ?? ''}`;
  }

  get boardingGroup(): string {
    // Derive from cabin class — real data would come from API
    if (!this.passenger.cabinClassName) return 'B';
    const c = this.passenger.cabinClassName.toLowerCase();
    if (c.includes('suite')) return 'S';
    if (c.includes('business')) return 'A';
    if (c.includes('premium')) return 'B';
    return 'C';
  }

  get gate(): string {
    return 'B' + ((this.passenger.passengerId % 30) + 1);
  }
}