// action-confirmation-modal.component.ts
import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { IPassengerEditDraft } from '../../../store/manage-booking.store';
import { IUpdatePassengerDto } from '@shared-core';

@Component({
  selector: 'app-action-confirmation-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  animations: [
    trigger('popIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.94) translateY(12px)' }),
        animate('340ms cubic-bezier(0.22,1,0.36,1)',
          style({ opacity: 1, transform: 'scale(1) translateY(0)' }))
      ])
    ])
  ],
  templateUrl: './action-confirmation-modal.component.html',
  styleUrls: ['./action-confirmation-modal.component.scss']
})
export class ActionConfirmationModalComponent {

  @Input() draft: IPassengerEditDraft | null = null;
  @Input() pendingDto: IUpdatePassengerDto | null = null;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  formatDate(iso: string | Date | null | undefined): string {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleDateString('en-SG', {
        day: '2-digit', month: 'short', year: 'numeric'
      });
    } catch { return String(iso); }
  }
}