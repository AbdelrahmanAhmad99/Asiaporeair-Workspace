

import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  animate,
  style,
  transition,
  trigger,
} from '@angular/animations';

import { CrewComplianceStore } from '../../store/crew-compliance.store';
import { ExpiringCertsListComponent } from '../../components/expiring-certs-list/expiring-certs-list.component';
import { WATCHDOG_THRESHOLDS } from '../../store/crew-watchdog.model';

// ── Animation: Ruby Red error banner ─────────────────────────────────────
export const bannerAnimation = trigger('bannerAnim', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(-14px)', maxHeight: '0px' }),
    animate('320ms cubic-bezier(0.4, 0, 0.2, 1)',
      style({ opacity: 1, transform: 'translateY(0)', maxHeight: '140px' })),
  ]),
  transition(':leave', [
    animate('200ms ease-in',
      style({ opacity: 0, transform: 'translateY(-8px)', maxHeight: '0px' })),
  ]),
]);

// ── Animation: Full Compliance toast ────────────────────────────────────
export const toastAnimation = trigger('toastAnim', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(16px) scale(0.96)' }),
    animate('360ms 100ms cubic-bezier(0.4, 0, 0.2, 1)',
      style({ opacity: 1, transform: 'translateY(0) scale(1)' })),
  ]),
  transition(':leave', [
    animate('180ms ease-in',
      style({ opacity: 0, transform: 'translateY(8px) scale(0.97)' })),
  ]),
]);

// ── Animation: Page content ───────────────────────────────────────────────
export const pageAnimation = trigger('pageAnim', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(10px)' }),
    animate('380ms 60ms cubic-bezier(0.4, 0, 0.2, 1)',
      style({ opacity: 1, transform: 'translateY(0)' })),
  ]),
]);

@Component({
  selector: 'aoms-compliance-watchdog-center',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ExpiringCertsListComponent,
  ],
  animations: [bannerAnimation, toastAnimation, pageAnimation],
  templateUrl: './compliance-watchdog-center.component.html',
  styleUrl: './compliance-watchdog-center.component.scss',
})
export class ComplianceWatchdogCenterComponent implements OnInit {

  // ── Store ─────────────────────────────────────────────────────────────
  protected readonly store = inject(CrewComplianceStore);

  // ── Expose store signals to template ─────────────────────────────────
  protected readonly expiringCerts = this.store.expiringCerts;
  protected readonly watchdogLoading = this.store.watchdogLoading;
  protected readonly watchdogError = this.store.watchdogError;
  protected readonly watchdogThreshold = this.store.watchdogThreshold;
  protected readonly watchdogSummary = this.store.watchdogSummary;
  protected readonly fullyCompliant = this.store.fullyCompliant;

  // ── Threshold options (const — no signal needed) ──────────────────────
  protected readonly thresholds = WATCHDOG_THRESHOLDS;

  // ── Lifecycle ─────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.store.loadExpiringCerts(this.store.watchdogThreshold());
  }

  // ── Threshold change ──────────────────────────────────────────────────
  protected onThresholdChanged(days: number): void {
    this.store.setThreshold(days);
  }

  // ── Navigation ────────────────────────────────────────────────────────
  protected onViewProfile(employeeId: number): void {
    this.store.navigateToTechnicalProfile(employeeId);
  }

  protected onNavigateToDirectory(): void {
    this.store.navigateBackToDirectory();
  }

  // ── Error handling ─────────────────────────────────────────────────────
  protected dismissError(): void {
    this.store.clearWatchdogError();
  }

  protected retryLoad(): void {
    this.store.loadExpiringCerts(this.store.watchdogThreshold());
  }

  // ── Full Compliance toast ─────────────────────────────────────────────
  protected dismissComplianceToast(): void {
    this.store.dismissFullyCompliantToast();
  }

  // ── Computed display helpers ──────────────────────────────────────────
  protected get currentTimestamp(): string {
    return new Date().toLocaleString('en-SG', {
      hour12: false,
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    });
  }

  protected get thresholdLabel(): string {
    const t = this.thresholds.find(t => t.value === this.watchdogThreshold());
    return t ? t.label : `${this.watchdogThreshold()} Days`;
  }
}