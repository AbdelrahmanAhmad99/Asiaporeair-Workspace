
import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IAncillaryProduct } from '@shared-core';

@Component({
  selector: 'app-ancillary-item-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ancillary-item-selector.component.html',
  styleUrls: ['./ancillary-item-selector.component.scss']
})
export class AncillaryItemSelectorComponent {

  // ── Inputs ────────────────────────────────────────────────────────────────
  readonly product = input.required<IAncillaryProduct>();
  readonly currency = input<string>('SGD');
  readonly quantity = input<number>(0);

  // ── Outputs ───────────────────────────────────────────────────────────────
  readonly quantityChange = output<number>();

  // ── Computed ──────────────────────────────────────────────────────────────
  readonly isSelected = computed(() => this.quantity() > 0);
  readonly lineTotal = computed(() => this.product().baseCost * this.quantity());

  readonly unitLabel = computed(() => {
    const unit = this.product().unitOfMeasure?.toUpperCase();
    if (unit === 'PER_KG') return 'per kg';
    if (unit === 'PER_FLIGHT') return 'per flight';
    if (unit === 'PER_PIECE') return 'per piece';
    if (unit === 'PER_DAY') return 'per day';
    return unit?.toLowerCase() ?? '';
  });

  // ── Handlers ──────────────────────────────────────────────────────────────

  increment(): void {
    this.quantityChange.emit(this.quantity() + 1);
  }

  decrement(): void {
    if (this.quantity() <= 0) return;
    this.quantityChange.emit(this.quantity() - 1);
  }

  toggle(): void {
    this.quantityChange.emit(this.quantity() > 0 ? 0 : 1);
  }

  formatPrice(amount: number): string {
    return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}