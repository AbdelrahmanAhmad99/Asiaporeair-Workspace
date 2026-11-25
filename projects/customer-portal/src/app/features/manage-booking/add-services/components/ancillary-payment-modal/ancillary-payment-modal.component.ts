// ancillary-payment-modal.component.ts
import {
  Component, Input, Output, EventEmitter,
  ChangeDetectionStrategy, signal, inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ICartItem } from '../../../store/manage-booking.store';

@Component({
  selector: 'app-ancillary-payment-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ancillary-payment-modal.component.html',
  styleUrls: ['./ancillary-payment-modal.component.scss']
})
export class AncillaryPaymentModalComponent {

  private readonly fb = inject(FormBuilder);

  @Input({ required: true }) cart!: ICartItem[];
  @Input() deltaAmount = 0;
  @Input() currency = 'SGD';
  @Input() bookingId = 0;
  @Input() isProcessing = false;

  @Output() cancel = new EventEmitter<void>();
  @Output() paymentSuccess = new EventEmitter<void>();
  @Output() paymentFailed = new EventEmitter<string>();

  readonly cardForm: FormGroup = this.fb.group({
    nameOnCard: ['', Validators.required],
    cardNumber: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
    expiry: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
    cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]]
  });

  readonly processingState = signal<'idle' | 'processing' | 'done'>('idle');

  get additions() { return this.cart.filter(i => i.mode === 'add'); }
  get removals() { return this.cart.filter(i => i.mode === 'remove'); }

  formatPrice(n: number | undefined | null): string {
    return (n ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 });
  }

  formatCardNumber(event: Event): void {
    const el = event.target as HTMLInputElement;
    el.value = el.value.replace(/\D/g, '').slice(0, 16);
    this.cardForm.get('cardNumber')?.setValue(el.value, { emitEvent: false });
  }

  formatExpiry(event: Event): void {
    const el = event.target as HTMLInputElement;
    let v = el.value.replace(/\D/g, '').slice(0, 4);
    if (v.length >= 3) v = v.slice(0, 2) + '/' + v.slice(2);
    el.value = v;
    this.cardForm.get('expiry')?.setValue(v, { emitEvent: false });
  }

  getFieldError(field: string): string | null {
    const ctrl = this.cardForm.get(field);
    if (!ctrl?.touched || ctrl.valid) return null;
    if (ctrl.hasError('required')) return 'Required';
    if (ctrl.hasError('pattern')) {
      if (field === 'cardNumber') return '16-digit card number required';
      if (field === 'expiry') return 'MM/YY format required';
      if (field === 'cvv') return '3 or 4 digit CVV required';
    }
    return 'Invalid';
  }

  onSubmit(): void {
    if (this.cardForm.invalid) {
      this.cardForm.markAllAsTouched();
      return;
    }
    this.processingState.set('processing');

    // Simulate payment processing — replace with real Stripe.js in production
    setTimeout(() => {
      this.processingState.set('done');
      setTimeout(() => this.paymentSuccess.emit(), 600);
    }, 2000);
  }
}