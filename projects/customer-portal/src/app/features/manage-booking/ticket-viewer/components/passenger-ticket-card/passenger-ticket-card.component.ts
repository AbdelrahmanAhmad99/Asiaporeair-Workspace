// passenger-ticket-card.component.ts
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ITicketDetailDto } from '@shared-core';

@Component({
  selector: 'app-passenger-ticket-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './passenger-ticket-card.component.html',
  styleUrls: ['./passenger-ticket-card.component.scss']
})
export class PassengerTicketCardComponent {
  @Input({ required: true }) ticket!: ITicketDetailDto;

  get fullName(): string {
    return `${this.ticket.passengerLastName?.toUpperCase() ?? ''} / ${this.ticket.passengerFirstName ?? ''}`;
  }

  get maskedPassport(): string {
    const pp = this.ticket.passengerPassportNumber;
    if (!pp) return '—';
    return pp.length > 4 ? '••••' + pp.slice(-4).toUpperCase() : pp;
  }

  get dobDisplay(): string {
    if (!this.ticket.passengerDateOfBirth) return '—';
    return new Date(this.ticket.passengerDateOfBirth).toLocaleDateString('en-SG', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }

  get boardingGroup(): string {
    const cabin = this.ticket.cabinClass?.toLowerCase() ?? '';
    if (cabin.includes('suite')) return 'S';
    if (cabin.includes('business')) return 'A';
    if (cabin.includes('premium')) return 'B';
    return 'C';
  }
}