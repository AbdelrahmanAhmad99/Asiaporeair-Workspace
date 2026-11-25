
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { LoyaltyIntelligenceStore, IRegistrationPayload } from '../../store/loyalty-intelligence.store';
import { AccountRegistrationFormComponent } from '../../components/account-registration-form/account-registration-form.component';
import { KrisflyerTierBadgeComponent } from '../../components/krisflyer-tier-badge/krisflyer-tier-badge.component';

@Component({
  selector: 'aoms-membership-registration-center',
  standalone: true,
  imports: [
    CommonModule,
    AccountRegistrationFormComponent,
    KrisflyerTierBadgeComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './membership-registration-center.component.html',
  styleUrl: './membership-registration-center.component.scss',
})
export class MembershipRegistrationCenterComponent implements OnDestroy {
  protected readonly store = inject(LoyaltyIntelligenceStore);
  private readonly router = inject(Router);

  protected readonly isDarkMode = signal<boolean>(
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('aoms-dark')
  );

  ngOnDestroy(): void {
    this.store.clearRegistrationState();
  }

  // ── Dark Mode ──────────────────────────────────────────────────────────
  protected toggleDarkMode(): void {
    const next = !this.isDarkMode();
    document.documentElement.classList.toggle('aoms-dark', next);
    this.isDarkMode.set(next);
  }

  // ── Navigation ─────────────────────────────────────────────────────────
  protected goToDashboard(): void {
    this.store.navigateToAccountManagerFromRegistration();
  }

  protected onViewNewAccount(): void {
    const account = this.store.registrationSuccess();
    if (account) {
      this.router.navigate([
        '/aoms/reservation-ground-handling/loyalty-intelligence/points-desk',
        account.linkedUserId,
      ]);
    }
  }

  protected onRegisterAnother(): void {
    this.store.clearRegistrationState();
  }

  // ── Form bridge ────────────────────────────────────────────────────────
  protected onFormSubmitted(payload: IRegistrationPayload): void {
    this.store.createNewAccount(payload);
  }

  // ── Error dismiss ──────────────────────────────────────────────────────
  protected onDismissError(): void {
    this.store.clearRegistrationState();
  }
}