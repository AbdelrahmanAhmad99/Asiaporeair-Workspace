// empty-trips-state.component.ts
import {
  Component, Input, Output, EventEmitter,
  ChangeDetectionStrategy, computed, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingFilter } from '../../../store/manage-booking.store';

const FILTER_SUBTEXTS: Record<BookingFilter, string> = {
  upcoming: 'No upcoming trips. Ready to explore?',
  past: 'No past trips found in this period.',
  cancelled: 'No cancelled bookings. Smooth skies!',
  all: 'Your next adventure is just a search away.'
};

@Component({
  selector: 'app-empty-trips-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './empty-trips-state.component.html',
  styleUrls: ['./empty-trips-state.component.scss']
})
export class EmptyTripsStateComponent {

  @Input() filter: BookingFilter = 'all';
  @Output() beginJourney = new EventEmitter<void>();

  get subText(): string {
    return FILTER_SUBTEXTS[this.filter] ?? FILTER_SUBTEXTS['all'];
  }
}