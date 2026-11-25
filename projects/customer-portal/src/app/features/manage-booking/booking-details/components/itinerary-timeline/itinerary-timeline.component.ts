// itinerary-timeline.component.ts
import { Component, Input, ChangeDetectionStrategy, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IBookingDetailDto } from '@shared-core';

@Component({
  selector: 'app-itinerary-timeline',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './itinerary-timeline.component.html',
  styleUrls: ['./itinerary-timeline.component.scss']
})
export class ItineraryTimelineComponent {

  @Input({ required: true }) detail!: IBookingDetailDto;

  get depTime(): string {
    if (!this.detail.flightDepartureTime) return '';
    return new Date(this.detail.flightDepartureTime)
      .toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit', hour12: false });
  }

  get depDate(): string {
    if (!this.detail.flightDepartureTime) return '';
    return new Date(this.detail.flightDepartureTime)
      .toLocaleDateString('en-SG', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  }

  get arrTime(): string {
    if (!this.detail.flightArrivalTime) return '';
    return new Date(this.detail.flightArrivalTime)
      .toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit', hour12: false });
  }

  get arrDate(): string {
    if (!this.detail.flightArrivalTime) return '';
    return new Date(this.detail.flightArrivalTime)
      .toLocaleDateString('en-SG', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  }

  get duration(): string {
    if (!this.detail.flightDepartureTime || !this.detail.flightArrivalTime) return '';
    const ms = new Date(this.detail.flightArrivalTime).getTime() -
      new Date(this.detail.flightDepartureTime).getTime();
    const h = Math.floor(ms / 3_600_000);
    const m = Math.floor((ms % 3_600_000) / 60_000);
    return `${h}h ${m}m`;
  }

  get isNextDay(): boolean {
    if (!this.detail.flightDepartureTime || !this.detail.flightArrivalTime) return false;
    const dep = new Date(this.detail.flightDepartureTime);
    const arr = new Date(this.detail.flightArrivalTime);
    return arr.getDate() !== dep.getDate() || arr.getMonth() !== dep.getMonth();
  }
}