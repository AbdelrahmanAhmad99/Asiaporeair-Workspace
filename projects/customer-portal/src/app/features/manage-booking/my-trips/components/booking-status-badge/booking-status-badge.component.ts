import {
  Component, Input, ChangeDetectionStrategy, computed, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingStatus } from '../../../store/manage-booking.store';

interface BadgeConfig {
  label: string;
  color: string;   // full-opacity text & dot color
  bg: string;   // 15% opacity background
  border: string;   // 40% opacity border
}

const STATUS_CONFIG: Record<BookingStatus, BadgeConfig> = {
  Confirmed: { label: 'Confirmed', color: '#2E7D52', bg: 'rgba(46,125,82,0.15)', border: 'rgba(46,125,82,0.40)' },
  PendingPayment: { label: 'Pending Payment', color: '#B87333', bg: 'rgba(184,115,51,0.15)', border: 'rgba(184,115,51,0.40)' },
  Cancelled: { label: 'Cancelled', color: '#d95f5f', bg: 'rgba(217,95,95,0.15)', border: 'rgba(217,95,95,0.40)' },
  CheckedIn: { label: 'Checked In', color: '#185FA5', bg: 'rgba(24,95,165,0.15)', border: 'rgba(24,95,165,0.40)' },
  Flown: { label: 'Completed', color: 'rgba(255,255,255,0.55)', bg: 'rgba(255,255,255,0.07)', border: 'rgba(255,255,255,0.20)' }
};

@Component({
  selector: 'app-booking-status-badge',
  templateUrl: './booking-status-badge.component.html',
  styleUrl: './booking-status-badge.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],

})
export class BookingStatusBadgeComponent {
  @Input({ required: true }) status!: BookingStatus;

  get config(): BadgeConfig {
    return STATUS_CONFIG[this.status] ?? STATUS_CONFIG['Confirmed'];
  }
}