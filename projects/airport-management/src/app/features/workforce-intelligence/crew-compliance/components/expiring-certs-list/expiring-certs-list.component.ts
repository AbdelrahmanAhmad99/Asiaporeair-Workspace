

import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { IExpiringCertRecord } from '../../store/crew-watchdog.model';
import { ComplianceStatusBadgeComponent } from '../compliance-status-badge/compliance-status-badge.component';

@Component({
  selector: 'aoms-expiring-certs-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ComplianceStatusBadgeComponent],
  templateUrl: './expiring-certs-list.component.html',
  styleUrl: './expiring-certs-list.component.scss',
})
export class ExpiringCertsListComponent {

  // ── Inputs ─────────────────────────────────────────────────────────────
  records = input.required<IExpiringCertRecord[]>();
  loading = input<boolean>(false);

  // ── Outputs ────────────────────────────────────────────────────────────
  viewProfile = output<number>();

  // ── Template helpers ───────────────────────────────────────────────────

  /** Returns the countdown text for the circular indicator ring. */
  countdownLabel(record: IExpiringCertRecord): string {
    const d = record.daysRemaining;
    if (d <= 0) return 'EXP';
    if (d === 1) return '1d';
    if (d < 100) return `${d}d`;
    return `${Math.ceil(d / 30)}mo`;
  }

  /**
   * CSS custom-property for the countdown ring fill (0 → 1).
   * Clamps to the watchdog window (≤ 90 days) so short countdowns are visually urgent.
   */
  ringProgress(record: IExpiringCertRecord, threshold: number = 90): number {
    const d = record.daysRemaining;
    if (d <= 0) return 0;
    return Math.min(d / threshold, 1);
  }

  /** CSS class for countdown ring colour. */
  ringClass(record: IExpiringCertRecord): string {
    switch (record.urgency) {
      case 'expired': return 'ecl-ring--expired';
      case 'critical': return 'ecl-ring--critical';
      case 'warning': return 'ecl-ring--warning';
      default: return 'ecl-ring--ok';
    }
  }

  /** Stroke-dashoffset value driving the SVG ring (circumference = 2π×16 ≈ 100.5). */
  ringOffset(record: IExpiringCertRecord, threshold: number = 90): string {
    const circumference = 100.53;
    const progress = this.ringProgress(record, threshold);
    return `${circumference * (1 - progress)}`;
  }

  /** Utility: format ISO date string to "DD MMM YYYY". */
  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-SG', {
      year: 'numeric', month: 'short', day: '2-digit',
    });
  }

  /** TrackBy for ngFor performance. */
  trackByCertId(_idx: number, record: IExpiringCertRecord): number {
    return record.certId;
  }

  onViewProfile(employeeId: number): void {
    this.viewProfile.emit(employeeId);
  }
}