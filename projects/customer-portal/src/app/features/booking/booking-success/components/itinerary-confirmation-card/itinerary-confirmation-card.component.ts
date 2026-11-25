// itinerary-confirmation-card.component.ts
import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IBookingDetailDto } from '@shared-core';

@Component({
  selector: 'app-itinerary-confirmation-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './itinerary-confirmation-card.component.html',
  styleUrls: ['./itinerary-confirmation-card.component.scss']
})
export class ItineraryConfirmationCardComponent {

  readonly bookingDetail = input.required<IBookingDetailDto>();
  readonly currency = input<string>('SGD');

  readonly depDate = computed(() => this.formatDate(this.bookingDetail().flightDepartureTime));
  readonly depTime = computed(() => this.formatTime(this.bookingDetail().flightDepartureTime));
  readonly arrDate = computed(() => this.formatDate(this.bookingDetail().flightArrivalTime));
  readonly arrTime = computed(() => this.formatTime(this.bookingDetail().flightArrivalTime));

  readonly duration = computed(() => {
    const dep = new Date(this.bookingDetail().flightDepartureTime);
    const arr = new Date(this.bookingDetail().flightArrivalTime);
    const diff = arr.getTime() - dep.getTime();
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return `${h}h ${m}m`;
  });

  private formatDate(iso: string | Date): string {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('en-SG', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  }

  private formatTime(iso: string | Date): string {
    if (!iso) return '';
    return new Date(iso).toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' });
  }
}