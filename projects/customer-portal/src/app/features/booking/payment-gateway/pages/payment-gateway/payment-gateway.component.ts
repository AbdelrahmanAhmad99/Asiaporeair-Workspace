// ============================================================================
// payment-gateway.component.ts
// Asiaporeair | "Finalize Your Suite Reservation" — Payment Smart Page
// ============================================================================

import {
  Component, OnInit, OnDestroy, inject, signal, computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  trigger, transition, style, animate, query, stagger
} from '@angular/animations';
import { Subject, takeUntil } from 'rxjs';

import { BookingStore, BookingStep } from '../../../store/booking.store';
import { PaymentsService } from '@shared-core';
import { BookingService } from '@shared-core';
import { IBookingDetailDto } from '@shared-core';
import { IPaymentIntentResponse } from '@shared-core';

import { BookingReviewAccordionComponent } from '../../components/booking-review-accordion/booking-review-accordion.component';
import { PaymentMethodSelectorComponent } from '../../components/payment-method-selector/payment-method-selector.component';
import { StripeCardElementComponent } from '../../components/stripe-card-element/stripe-card-element.component';

// ── Payment Methods ───────────────────────────────────────────────────────────
export type PaymentMethodKey = 'CreditCard' | 'PayPal' | 'AMEX';

export interface IPaymentMethod {
  key: PaymentMethodKey;
  label: string;
  description: string;
  iconType: string;
}

export const PAYMENT_METHODS: IPaymentMethod[] = [
  { key: 'CreditCard', label: 'Credit / Debit Card', description: 'Visa, Mastercard, JCB, Discover', iconType: 'card' },
  { key: 'PayPal', label: 'PayPal', description: 'Pay with your PayPal account', iconType: 'paypal' },
  { key: 'AMEX', label: 'American Express', description: '0% interest · 6-month instalment', iconType: 'amex' }
];

// ── Animations ────────────────────────────────────────────────────────────────
const PAYMENT_ANIMATIONS = [
  trigger('pageEnter', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateY(20px)' }),
      animate('500ms cubic-bezier(0.16,1,0.3,1)', style({ opacity: 1, transform: 'translateY(0)' }))
    ])
  ]),
  trigger('sectionStagger', [
    transition(':enter', [
      query('.stagger-item', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        stagger(80, [
          animate('420ms cubic-bezier(0.16,1,0.3,1)', style({ opacity: 1, transform: 'translateY(0)' }))
        ])
      ], { optional: true })
    ])
  ]),
  trigger('fadeSlide', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateY(12px)' }),
      animate('350ms cubic-bezier(0.16,1,0.3,1)', style({ opacity: 1, transform: 'translateY(0)' }))
    ])
  ])
];

// ── Payment Flow State ────────────────────────────────────────────────────────
export type PaymentFlowState =
  | 'idle'
  | 'creating-intent'
  | 'awaiting-stripe'
  | 'confirming'
  | 'succeeded'
  | 'failed';

@Component({
  selector: 'app-payment-gateway',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    BookingReviewAccordionComponent,
    PaymentMethodSelectorComponent,
    StripeCardElementComponent
  ],
  animations: PAYMENT_ANIMATIONS,
  templateUrl: './payment-gateway.component.html',
  styleUrls: ['./payment-gateway.component.scss']
})
export class PaymentGatewayComponent implements OnInit, OnDestroy {

  // ── DI ────────────────────────────────────────────────────────────────────
  readonly bookingStore = inject(BookingStore);
  private readonly paymentsService = inject(PaymentsService);
  private readonly bookingService = inject(BookingService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly destroy$ = new Subject<void>();

  // ── Store Reads ───────────────────────────────────────────────────────────
  readonly confirmedBooking = computed(() => this.bookingStore.confirmedBooking());
  readonly seatAssignments = computed(() => this.bookingStore.seatAssignments());
  readonly selectedFlight = computed(() => this.bookingStore.selectedFlight());
  readonly selectedFare = computed(() => this.bookingStore.selectedFare());
  readonly searchCriteria = computed(() => this.bookingStore.searchCriteria());
  readonly currency = signal<string>('SGD');

  // ── Booking Detail State ──────────────────────────────────────────────────
  readonly bookingDetail = signal<IBookingDetailDto | null>(null);
  readonly isLoadingDetail = signal<boolean>(false);
  readonly detailError = signal<string | null>(null);

  // ── Payment Intent State ──────────────────────────────────────────────────
  readonly paymentIntent = signal<IPaymentIntentResponse | null>(null);
  readonly flowState = signal<PaymentFlowState>('idle');
  readonly paymentError = signal<string | null>(null);
  readonly sessionTimer = signal<number>(8 * 60); // 8 minutes in seconds

  // ── UI State ──────────────────────────────────────────────────────────────
  readonly selectedMethod = signal<PaymentMethodKey>('CreditCard');
  readonly paymentMethods = signal<IPaymentMethod[]>(PAYMENT_METHODS);

  // ── Forms ─────────────────────────────────────────────────────────────────
  readonly cardForm: FormGroup = this.fb.group({
    cardNumber: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
    expiry: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
    cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
    nameOnCard: ['', Validators.required],
    addressLine: ['', Validators.required],
    country: ['', Validators.required],
    city: ['', Validators.required],
    postalCode: ['']
  });

  // ── Computed ──────────────────────────────────────────────────────────────

  readonly journeyLabel = computed(() => {
    const c = this.searchCriteria();
    if (!c?.segments?.length) return '';
    return `${c.segments[0].originIataCode} → ${c.segments[c.segments.length - 1].destinationIataCode}`;
  });

  readonly grandTotal = computed(() => {
    const detail = this.bookingDetail();
    return detail?.totalPrice ?? this.confirmedBooking()?.totalPrice ?? 0;
  });

  readonly isProcessing = computed(() =>
    this.flowState() === 'creating-intent' ||
    this.flowState() === 'awaiting-stripe' ||
    this.flowState() === 'confirming'
  );

  readonly timerDisplay = computed(() => {
    const t = this.sessionTimer();
    const m = Math.floor(t / 60).toString().padStart(2, '0');
    const s = (t % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  });

  readonly timerIsWarning = computed(() => this.sessionTimer() < 120);

  private timerInterval: ReturnType<typeof setInterval> | null = null;

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.loadBookingDetail();
    this.startSessionTimer();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  // ── Private Loaders ───────────────────────────────────────────────────────

  private loadBookingDetail(): void {
    const booking = this.confirmedBooking();
    if (!booking) {
      this.detailError.set('Booking information is unavailable. Please return to the previous step.');
      return;
    }

    this.isLoadingDetail.set(true);
    this.detailError.set(null);

    this.bookingService.getBookingDetails(booking.bookingId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (detail) => {
          this.bookingDetail.set(detail);
          this.isLoadingDetail.set(false);
        },
        error: (err) => {
          console.error('Booking detail load error:', err);
          this.detailError.set('Unable to load booking details. Please refresh the page.');
          this.isLoadingDetail.set(false);
        }
      });
  }

  private startSessionTimer(): void {
    this.timerInterval = setInterval(() => {
      this.sessionTimer.update(t => {
        if (t <= 0) {
          clearInterval(this.timerInterval!);
          this.paymentError.set('Your session has expired. Please restart the booking process.');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }

  // ── Public Actions ────────────────────────────────────────────────────────

  selectMethod(method: PaymentMethodKey): void {
    this.selectedMethod.set(method);
    this.paymentError.set(null);
  }

  onBack(): void {
    this.bookingStore.goToStep(BookingStep.Seats);
    this.router.navigate(['/booking/seat-selection']);
  }

  /**
   * Full payment flow:
   * 1. createPaymentIntent → get clientSecret
   * 2. Process via Stripe (simulated)
   * 3. confirmPayment → verify on server
   * 4. On 'Succeeded' → persist to store → navigate to success
   */
  onSecurePayment(): void {
    const method = this.selectedMethod();
    const booking = this.confirmedBooking();

    if (!booking) {
      this.paymentError.set('Booking data is missing. Please restart your booking.');
      return;
    }

    if (method === 'CreditCard' && this.cardForm.invalid) {
      this.cardForm.markAllAsTouched();
      this.paymentError.set('Please complete all required card fields before proceeding.');
      return;
    }

    this.paymentError.set(null);
    this.flowState.set('creating-intent');

    // Step 1: Create Payment Intent
    this.paymentsService.createPaymentIntent({
      bookingId: booking.bookingId,
      currency: this.currency().toLowerCase()
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (intent) => {
          this.paymentIntent.set(intent);
          this.flowState.set('awaiting-stripe');
          // Step 2: Simulate Stripe client-side processing
          this.simulateStripeProcessing(intent);
        },
        error: (err) => {
          console.error('Payment intent error:', err);
          this.flowState.set('failed');
          this.paymentError.set(
            err?.error?.message ?? 'Unable to initiate payment. Please try again.'
          );
        }
      });
  }

  /**
   * Simulates Stripe.js confirmCardPayment() client-side call.
   * In production, replace with actual Stripe.js integration using
   * the clientSecret from the intent.
   */
  private simulateStripeProcessing(intent: IPaymentIntentResponse): void {
    // Simulate async Stripe processing (300ms)
    setTimeout(() => {
      this.flowState.set('confirming');
      this.confirmPaymentOnServer(intent);
    }, 1200);
  }

  private confirmPaymentOnServer(intent: IPaymentIntentResponse): void {
    const method = this.selectedMethod();
    const cv = this.cardForm.value;

    this.paymentsService.confirmPayment({
      paymentIntentId: intent.paymentIntentId,
      paymentMethodId: 'pm_card_visa', // Simulated payment method for mock flow
      returnUrl: `${window.location.origin}/booking/booking-success`
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (transaction) => {
          if (transaction.status?.toLowerCase() === 'succeeded') {
            this.flowState.set('succeeded');
            this.bookingStore.setCompletedPayment(transaction);
            // Short delay for success animation, then navigate
            setTimeout(() => {
              this.router.navigate(['/booking/booking-success']);
            }, 1800);
          } else {
            this.flowState.set('failed');
            this.paymentError.set(
              `Payment status: ${transaction.status}. Please contact support or try again.`
            );
          }
        },
        error: (err) => {
          console.error('Payment confirm error:', err);
          this.flowState.set('failed');
          this.paymentError.set(
            err?.error?.message ?? 'Payment confirmation failed. Your card has not been charged.'
          );
        }
      });
  }

  onRetryPayment(): void {
    this.flowState.set('idle');
    this.paymentError.set(null);
    this.paymentIntent.set(null);
  }

  // ── Template Helpers ──────────────────────────────────────────────────────

  formatPrice(amount: number): string {
    return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  getFieldError(fieldName: string): string | null {
    const control = this.cardForm.get(fieldName);
    if (!control?.touched || control.valid) return null;
    if (control.hasError('required')) return 'This field is required';
    if (control.hasError('pattern')) {
      if (fieldName === 'cardNumber') return 'Enter a valid 16-digit card number';
      if (fieldName === 'expiry') return 'Use MM/YY format';
      if (fieldName === 'cvv') return 'Enter 3 or 4 digit CVV';
    }
    return 'Invalid value';
  }
}