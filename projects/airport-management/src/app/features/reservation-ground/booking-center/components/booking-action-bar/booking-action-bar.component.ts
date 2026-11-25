
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { IBookingDetailDto } from '@shared-core';
import { ExplorerActionState } from '../../store/booking-center.store';

@Component({
  selector: 'aoms-booking-action-bar',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './booking-action-bar.component.html',
  styleUrl: './booking-action-bar.component.scss',
})
export class BookingActionBarComponent {
  readonly booking = input.required<IBookingDetailDto>();
  readonly actionProcessing = input<boolean>(false);
  readonly actionState = input<ExplorerActionState>('idle');

  readonly cancelRequested = output<void>();
  readonly updateStatusRequested = output<void>();
  readonly issueTicketsRequested = output<void>();

  readonly isCancelled = computed<boolean>(() => this.booking().isCancelled);
  readonly isCancelling = computed<boolean>(() => this.actionState() === 'cancelling');
  readonly isPatching = computed<boolean>(() => this.actionState() === 'patching');
}