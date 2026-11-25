
import {
  ChangeDetectionStrategy,
  Component,
  OnChanges,
  SimpleChanges,
  computed,
  input,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export type PaymentStatusVisualKind = 'success' | 'failed' | 'refunded' | 'pending' | 'neutral';

@Component({
  selector: 'aoms-payment-status-badge',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './payment-status-badge.component.html',
  styleUrl: './payment-status-badge.component.scss',
})
export class PaymentStatusBadgeComponent implements OnChanges {
  // ── Inputs ──────────────────────────────────────────────────────────────
  readonly status = input.required<string>();

  /** Compact mode renders a smaller dot-only badge for dense grid rows. */
  readonly compact = input<boolean>(false);

  // ── Transition tracking for the shimmer-on-refund effect ──────────────
  private _previousKind: PaymentStatusVisualKind | null = null;
  protected readonly justTransitionedToRefunded = signal<boolean>(false);
  private _shimmerTimeout: ReturnType<typeof setTimeout> | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['status']) return;

    const currentKind = this.kind();
    if (this._previousKind !== null && this._previousKind !== 'refunded' && currentKind === 'refunded') {
      // Transitioned INTO refunded — play the one-shot shimmer sweep
      this.justTransitionedToRefunded.set(true);
      if (this._shimmerTimeout) clearTimeout(this._shimmerTimeout);
      this._shimmerTimeout = setTimeout(() => this.justTransitionedToRefunded.set(false), 1400);
    }
    this._previousKind = currentKind;
  }

  // ── Computed ──────────────────────────────────────────────────────────
  readonly kind = computed<PaymentStatusVisualKind>(() => {
    const s = (this.status() ?? '').toLowerCase().trim();
    if (s === 'succeeded' || s === 'captured' || s === 'completed' || s === 'success' || s === 'paid') return 'success';
    if (s === 'failed' || s === 'declined' || s === 'cancelled' || s === 'failure') return 'failed';
    if (s === 'refunded' || s === 'partially_refunded') return 'refunded';
    if (s === 'pending' || s === 'processing' || s === 'requires_action') return 'pending';
    return 'neutral';
  });

  readonly cssClass = computed<string>(() => `psb-badge--${this.kind()}`);

  readonly iconPath = computed<string>(() => {
    switch (this.kind()) {
      case 'success':
        return 'M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z';
      case 'failed':
        return 'M9.75 9.75l4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z';
      case 'refunded':
        return 'M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3';
      case 'pending':
        return 'M12 6v6l4 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z';
      default:
        return 'M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z';
    }
  });
}