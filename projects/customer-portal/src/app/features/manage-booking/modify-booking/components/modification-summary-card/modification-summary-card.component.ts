// modification-summary-card.component.ts
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IBookingDetailDto } from '@shared-core';
import { IPassengerEditDraft } from '../../../store/manage-booking.store';

@Component({
  selector: 'app-modification-summary-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './modification-summary-card.component.html',
  styleUrls: ['./modification-summary-card.component.scss']
})
export class ModificationSummaryCardComponent {
  @Input({ required: true }) detail!: IBookingDetailDto;
  @Input() drafts: IPassengerEditDraft[] = [];
  @Input() hasUnsaved = false;

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

  get savedCount(): number { return this.drafts.filter(d => d.savedAt !== null).length; }
  get totalCount(): number { return this.drafts.length; }
  get dirtyCount(): number { return this.drafts.filter(d => d.isDirty).length; }
}