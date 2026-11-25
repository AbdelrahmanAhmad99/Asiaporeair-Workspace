
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CertUrgency, computeDaysRemaining, classifyUrgency } from '../../store/crew-watchdog.model';

@Component({
  selector: 'aoms-compliance-status-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './compliance-status-badge.component.html',
  styleUrl: './compliance-status-badge.component.scss',
})
export class ComplianceStatusBadgeComponent {

  /** ISO date string from the backend (e.g. "2025-03-15T00:00:00"). */
  expiryDate = input.required<string>();

  /** Pre-computed days remaining (optional — if not provided, computed from expiryDate). */
  daysRemaining = input<number | null>(null);

  // ── Computed urgency classification ──────────────────────────────────
  protected readonly urgency = computed<CertUrgency>(() => {
    const provided = this.daysRemaining();
    const days = provided !== null ? provided : computeDaysRemaining(this.expiryDate());
    return classifyUrgency(days);
  });

  protected readonly effectiveDays = computed<number>(() => {
    const provided = this.daysRemaining();
    return provided !== null ? provided : computeDaysRemaining(this.expiryDate());
  });

  // ── Computed CSS class ─────────────────────────────────────────────────
  protected readonly badgeClass = computed<string>(() => {
    const urgencyClassMap: Record<CertUrgency, string> = {
      expired: 'csb-badge--expired',
      critical: 'csb-badge--critical',
      warning: 'csb-badge--warning',
      ok: 'csb-badge--ok',
    };
    return urgencyClassMap[this.urgency()];
  });

  // ── Computed label text ────────────────────────────────────────────────
  protected readonly badgeLabel = computed<string>(() => {
    const days = this.effectiveDays();
    switch (this.urgency()) {
      case 'expired': return 'Expired';
      case 'critical': return `${days}d Critical`;
      case 'warning': return `${days}d Warning`;
      case 'ok': return `${days}d Valid`;
    }
  });

  // ── Computed ARIA label (accessibility) ───────────────────────────────
  protected readonly ariaLabel = computed<string>(() => {
    const days = this.effectiveDays();
    switch (this.urgency()) {
      case 'expired': return 'Certification expired — immediate renewal required';
      case 'critical': return `Certification expiring in ${days} days — critical action required`;
      case 'warning': return `Certification expiring in ${days} days — renewal recommended`;
      case 'ok': return `Certification valid for ${days} more days`;
    }
  });

  // ── Computed tooltip ──────────────────────────────────────────────────
  protected readonly tooltipText = computed<string>(() => {
    const expiry = this.expiryDate();
    if (!expiry) return 'No expiry date on record';
    const formatted = new Date(expiry).toLocaleDateString('en-SG', {
      year: 'numeric', month: 'short', day: '2-digit',
    });
    const days = this.effectiveDays();
    if (days <= 0) return `Expired on ${formatted}`;
    return `Expires ${formatted} (${days} days remaining)`;
  });
}