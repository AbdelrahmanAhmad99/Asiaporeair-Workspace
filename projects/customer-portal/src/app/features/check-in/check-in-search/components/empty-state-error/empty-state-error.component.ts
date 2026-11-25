// ============================================================================
// empty-state-error.component.ts
// Asiaporeair | Sophisticated Error Display — Check-in Flow
// ============================================================================

import {
  Component, Input, Output, EventEmitter, ChangeDetectionStrategy, computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckInSearchStatus } from '../../../store/check-in.store';

interface IErrorPresentation {
  iconType: 'search' | 'clock' | 'wifi' | 'lock';
  heading: string;
  body: string;
  ctaLabel: string;
}

@Component({
  selector: 'app-empty-state-error',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './empty-state-error.component.html',
  styleUrl: './empty-state-error.component.scss',
})
export class EmptyStateErrorComponent {
  @Input() status: CheckInSearchStatus = 'error';
  @Input() errorMessage: string | null = null;
  @Output() onRetry = new EventEmitter<void>();

  readonly presentation = computed((): IErrorPresentation => {
    switch (this.status) {
      case 'not_found':
        return {
          iconType: 'search',
          heading: 'Journey Not Located',
          body: 'We were unable to find a booking matching the provided reference. Please verify your booking confirmation email and try again.',
          ctaLabel: 'Search Again'
        };
      case 'not_open':
        return {
          iconType: 'clock',
          heading: 'Check-in Not Yet Open',
          body: 'Online check-in for this flight opens 48 hours before departure. Please return closer to your travel date.',
          ctaLabel: 'Try Another Booking'
        };
      case 'error':
      default:
        return {
          iconType: 'wifi',
          heading: 'Service Temporarily Unavailable',
          body: 'Our concierge systems are momentarily unavailable. Please try again in a few moments or contact our support team.',
          ctaLabel: 'Retry'
        };
    }
  });
}