// cancellation-summary-card.component.ts
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IBookingDetailDto } from '@shared-core';
import { CancellationStatus } from '../../../store/manage-booking.store';

@Component({
  selector: 'app-cancellation-summary-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './cancellation-summary-card.component.html',
  styleUrls: ['./cancellation-summary-card.component.scss']
})
export class CancellationSummaryCardComponent {
  @Input({ required: true }) detail!: IBookingDetailDto;
  @Input() currency = 'SGD';
  @Input() cancellationStatus: CancellationStatus = 'idle';

  get depDate(): string {
    if (!this.detail.flightDepartureTime) return '';
    return new Date(this.detail.flightDepartureTime).toLocaleDateString('en-SG', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
    });
  }
  get depTime(): string {
    if (!this.detail.flightDepartureTime) return '';
    return new Date(this.detail.flightDepartureTime).toLocaleTimeString('en-SG', {
      hour: '2-digit', minute: '2-digit', hour12: false
    });
  }
  formatPrice(n: number): string {
    return n.toLocaleString('en-US', { minimumFractionDigits: 2 });
  }
  get isPending(): boolean { return this.cancellationStatus === 'pending'; }
  get isSuccess(): boolean { return this.cancellationStatus === 'success'; }
}