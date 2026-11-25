// stripe-card-element.component.ts
import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-stripe-card-element',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './stripe-card-element.component.html',
  styleUrls: ['./stripe-card-element.component.scss']
})
export class StripeCardElementComponent {

  readonly form = input.required<FormGroup>();
  readonly currency = input<string>('SGD');
  readonly amount = input<number>(0);
  readonly getFieldError = input<(field: string) => string | null>(() => null);

  // Track active field for floating-label effect
  activeField: string | null = null;

  onFocus(field: string): void { this.activeField = field; }
  onBlur(): void { this.activeField = null; }

  formatAmount(amount: number): string {
    return amount.toLocaleString('en-US', { minimumFractionDigits: 2 });
  }

  // Auto-format card number with spaces
  onCardInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let val = input.value.replace(/\D/g, '').slice(0, 16);
    input.value = val;
    this.form().patchValue({ cardNumber: val }, { emitEvent: false });
  }

  // Auto-format MM/YY
  onExpiryInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let val = input.value.replace(/\D/g, '').slice(0, 4);
    if (val.length >= 3) val = val.slice(0, 2) + '/' + val.slice(2);
    input.value = val;
    this.form().patchValue({ expiry: val }, { emitEvent: false });
  }
}