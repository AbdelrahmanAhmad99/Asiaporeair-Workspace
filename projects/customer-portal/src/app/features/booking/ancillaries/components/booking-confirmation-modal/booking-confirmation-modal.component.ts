// ============================================================================
// booking-confirmation-modal.component.ts
// Asiaporeair | Dumb — High-end booking confirmation overlay
// ============================================================================

import {
  Component, input, output, OnInit, signal, computed,
  HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { IBookingDto } from '@shared-core';

const MODAL_ANIMATIONS = [
  trigger('backdropFade', [
    transition(':enter', [
      style({ opacity: 0 }),
      animate('250ms ease-out', style({ opacity: 1 }))
    ]),
    transition(':leave', [
      animate('200ms ease-in', style({ opacity: 0 }))
    ])
  ]),
  trigger('modalSlide', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateY(32px) scale(0.96)' }),
      animate('400ms 80ms cubic-bezier(0.16,1,0.3,1)',
        style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
    ]),
    transition(':leave', [
      animate('250ms cubic-bezier(0.4,0,1,1)',
        style({ opacity: 0, transform: 'translateY(16px) scale(0.97)' }))
    ])
  ]),
  trigger('detailStagger', [
    transition(':enter', [
      query('.detail-row', [
        style({ opacity: 0, transform: 'translateX(-12px)' }),
        stagger(60, [
          animate('340ms cubic-bezier(0.16,1,0.3,1)',
            style({ opacity: 1, transform: 'translateX(0)' }))
        ])
      ], { optional: true })
    ])
  ])
];

@Component({
  selector: 'app-booking-confirmation-modal',
  standalone: true,
  imports: [CommonModule],
  animations: MODAL_ANIMATIONS,
  templateUrl: './booking-confirmation-modal.component.html',
  styleUrls: ['./booking-confirmation-modal.component.scss']
})
export class BookingConfirmationModalComponent implements OnInit {

  // ── Inputs / Outputs ──────────────────────────────────────────────────────
  readonly booking = input.required<IBookingDto>();
  readonly currency = input<string>('SGD');
  readonly dismiss = output<void>();

  // ── Internal ──────────────────────────────────────────────────────────────
  readonly tickerVisible = signal<boolean>(false);
  readonly pnrChars = signal<string[]>([]);

  readonly departureDate = computed(() => {
    const raw = this.booking()?.flightDepartureTime;
    if (!raw) return '';
    return new Date(raw).toLocaleDateString('en-SG', {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
    });
  });

  readonly departureTime = computed(() => {
    const raw = this.booking()?.flightDepartureTime;
    if (!raw) return '';
    return new Date(raw).toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' });
  });

  readonly bookingDate = computed(() => {
    const raw = this.booking()?.bookingTime;
    if (!raw) return '';
    return new Date(raw).toLocaleDateString('en-SG', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  });

  ngOnInit(): void {
    // Animate PNR characters in one by one
    const ref = this.booking()?.bookingReference ?? '';
    this.pnrChars.set(ref.split(''));
    setTimeout(() => this.tickerVisible.set(true), 200);
  }

  // Close on backdrop click or Escape
  @HostListener('document:keydown.escape')
  onEscape(): void { this.onDismiss(); }

  onBackdropClick(event: Event): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.onDismiss();
    }
  }

  onDismiss(): void {
    this.dismiss.emit();
  }

  formatPrice(amount: number): string {
    return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  trackByIdx(index: number): number { return index; }
}