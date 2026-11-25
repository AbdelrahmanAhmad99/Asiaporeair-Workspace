// itinerary-summary-row.component.ts
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ITicketDetailDto } from '@shared-core';

@Component({
  selector: 'app-itinerary-summary-row',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './itinerary-summary-row.component.html',
  styleUrls: ['./itinerary-summary-row.component.scss']
})
export class ItinerarySummaryRowComponent {
  @Input({ required: true }) ticket!: ITicketDetailDto;

  get depTime(): string { return this.formatTime(this.ticket.flightDepartureTime); }
  get depDate(): string { return this.formatDate(this.ticket.flightDepartureTime); }
  get arrTime(): string { return this.formatTime(this.ticket.flightArrivalTime); }
  get arrDate(): string { return this.formatDate(this.ticket.flightArrivalTime); }

  get duration(): string {
    const ms = new Date(this.ticket.flightArrivalTime).getTime() - new Date(this.ticket.flightDepartureTime).getTime();
    const h = Math.floor(ms / 3_600_000);
    const m = Math.floor((ms % 3_600_000) / 60_000);
    return `${h}h ${m}m`;
  }

  get isNextDay(): boolean {
    const d = new Date(this.ticket.flightDepartureTime);
    const a = new Date(this.ticket.flightArrivalTime);
    return a.getDate() !== d.getDate();
  }

  get cabinDisplay(): string {
    const map: Record<string, string> = { Economy: 'Economy', PremiumEconomy: 'Premium Economy', Business: 'Business Class', Suite: 'Suites — First Class' };
    return map[this.ticket.cabinClass] ?? this.ticket.cabinClass;
  }

  private formatTime(iso: string | Date): string {
    return new Date(iso).toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit', hour12: false });
  }
  private formatDate(iso: string | Date): string {
    return new Date(iso).toLocaleDateString('en-SG', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  }
}