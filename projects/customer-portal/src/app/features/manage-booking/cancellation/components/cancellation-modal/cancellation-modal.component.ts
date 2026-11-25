// cancellation-modal.component.ts
import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { IBookingDetailDto } from '@shared-core';

@Component({
  selector: 'app-cancellation-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  animations: [
    trigger('popIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.93) translateY(14px)' }),
        animate('380ms cubic-bezier(0.22,1,0.36,1)',
          style({ opacity: 1, transform: 'scale(1) translateY(0)' }))
      ])
    ])
  ],
  templateUrl: './cancellation-modal.component.html',
  styleUrls: ['./cancellation-modal.component.scss']
})
export class CancellationModalComponent {
  @Input({ required: true }) detail!: IBookingDetailDto;
  @Input() reason = '';
  @Input() totalPrice = 0;
  @Input() currency = 'SGD';

  @Output() keepBooking = new EventEmitter<void>();
  @Output() confirmCancellation = new EventEmitter<void>();

  formatPrice(n: number): string {
    return n.toLocaleString('en-US', { minimumFractionDigits: 2 });
  }
}