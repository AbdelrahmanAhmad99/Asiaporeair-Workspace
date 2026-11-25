// booking-inventory-list.component.ts
import {
  Component, Input, Output, EventEmitter, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IExistingAncillary, ICartItem } from '../../../store/manage-booking.store';

@Component({
  selector: 'app-booking-inventory-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './booking-inventory-list.component.html',
  styleUrls: ['./booking-inventory-list.component.scss']
})
export class BookingInventoryListComponent {

  @Input({ required: true }) ancillaries!: IExistingAncillary[];
  @Input() stagedRemovals: ICartItem[] = [];

  @Output() stageRemoval = new EventEmitter<IExistingAncillary>();
  @Output() unstageRemoval = new EventEmitter<number>();

  isStagedForRemoval(saleId: number): boolean {
    return this.stagedRemovals.some(i => i.mode === 'remove' && i.saleId === saleId);
  }

  formatPrice(n: number | undefined | null): string {
    return (n ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 });
  }

  trackBySale(_: number, a: IExistingAncillary): number { return a.saleId; }
}