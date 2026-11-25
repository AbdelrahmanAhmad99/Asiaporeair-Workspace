// payment-method-selector.component.ts
import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IPaymentMethod, PaymentMethodKey } from '../../pages/payment-gateway/payment-gateway.component';

@Component({
  selector: 'app-payment-method-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-method-selector.component.html',
  styleUrls: ['./payment-method-selector.component.scss']
})
export class PaymentMethodSelectorComponent {

  readonly methods = input<IPaymentMethod[]>([]);
  readonly selectedMethod = input<PaymentMethodKey>('CreditCard');
  readonly methodSelect = output<PaymentMethodKey>();

  onSelect(key: PaymentMethodKey): void {
    this.methodSelect.emit(key);
  }

  trackByKey(_: number, m: IPaymentMethod): string { return m.key; }
}