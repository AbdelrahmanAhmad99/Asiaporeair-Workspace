

import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { animate, style, transition, trigger } from '@angular/animations';

import { WorkforceWdoStore } from '../../store/workforce-wdo.store';
import { OnboardingStepIndicatorComponent } from '../../components/onboarding-step-indicator/onboarding-step-indicator.component';
import { UserRoleSelectorComponent } from '../../components/user-role-selector/user-role-selector.component';
import { UserRegistrationDynamicComponent } from '../../components/user-registration-dynamic/user-registration-dynamic.component';
import {
  OnboardingRole, IOnboardingPayload,
} from '../../store/workforce-wdo.store';

const WDO_BASE = 'aoms/workforce-intelligence/workforce-directory';

// Panel slide animation: step 1→2 slides right-to-left, step 2→1 left-to-right
const STEP_ANIMATIONS = [
  trigger('stepIn', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateX(32px)' }),
      animate('300ms 60ms cubic-bezier(0.4,0,0.2,1)',
        style({ opacity: 1, transform: 'translateX(0)' })),
    ]),
    transition(':leave', [
      animate('200ms ease-in',
        style({ opacity: 0, transform: 'translateX(-24px)' })),
    ]),
  ]),
  trigger('successIn', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateY(24px) scale(0.96)' }),
      animate('380ms cubic-bezier(0.34,1.56,0.64,1)',
        style({ opacity: 1, transform: 'translateY(0) scale(1)' })),
    ]),
  ]),
];

@Component({
  selector: 'aoms-workforce-onboarding-wizard',
  standalone: true,
  imports: [
    CommonModule,
    OnboardingStepIndicatorComponent,
    UserRoleSelectorComponent,
    UserRegistrationDynamicComponent,
  ],
  animations: STEP_ANIMATIONS,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './workforce-onboarding-wizard.component.html',
  styleUrl: './workforce-onboarding-wizard.component.scss',
})
export class WorkforceOnboardingWizardComponent implements OnInit {
  protected readonly store = inject(WorkforceWdoStore);
  private readonly router = inject(Router);

  protected readonly isDarkMode = signal<boolean>(
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('aoms-dark')
  );

  ngOnInit(): void {
    this.store.loadSupportingData();
    this.store.resetOnboarding();
  }

  // ── Navigation ──────────────────────────────────────────────────────
  protected goBackToDirectory(): void {
    this.router.navigate([WDO_BASE, 'inventory-dashboard']);
  }

  protected toggleDarkMode(): void {
    const next = !this.isDarkMode();
    document.documentElement.classList.toggle('aoms-dark', next);
    this.isDarkMode.set(next);
  }

  // ── Step Logic ──────────────────────────────────────────────────────
  protected onRoleSelected(role: OnboardingRole): void {
    this.store.setRole(role);
  }

  protected onFormBack(): void {
    this.store.goBackToRoleSelection();
  }

  protected async onFormSubmitted(payload: IOnboardingPayload): Promise<void> {
    await this.store.executeRegistration(payload);
  }

  protected onRegisterAnother(): void {
    this.store.resetOnboarding();
  }

  protected onViewProfile(): void {
    // Navigate to directory — the profile hub requires an employeeId which
    // comes from the employee list after the background refresh.
    this.router.navigate([WDO_BASE, 'inventory-dashboard']);
  }
}