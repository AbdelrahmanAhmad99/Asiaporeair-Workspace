

import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  animate, query, stagger, style, transition, trigger,
} from '@angular/animations';

import { WorkforceWdoStore } from '../../store/workforce-wdo.store';
import { ProfileIdentityHeaderComponent } from '../../components/profile-identity-header/profile-identity-header.component';
import { SalaryManagementCardComponent } from '../../components/salary-management-card/salary-management-card.component';
import { AccountStatusToggleComponent } from '../../components/account-status-toggle/account-status-toggle.component';
import { EmployeeSummaryWidgetComponent } from '../../components/employee-summary-widget/employee-summary-widget.component';
import { ISalaryUpdate } from '../../components/salary-management-card/salary-management-card.component';

const WDO_BASE = 'aoms/workforce-intelligence/workforce-directory';

// Staggered card entry animation
const CARD_STAGGER = trigger('cardsIn', [
  transition(':enter', [
    query('.eph-card', [
      style({ opacity: 0, transform: 'translateY(16px)' }),
      stagger(80, [
        animate('320ms cubic-bezier(0.4,0,0.2,1)',
          style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ], { optional: true }),
  ]),
]);

@Component({
  selector: 'aoms-employee-profile-hub',
  standalone: true,
  imports: [
    CommonModule,
    ProfileIdentityHeaderComponent,
    SalaryManagementCardComponent,
    AccountStatusToggleComponent,
    EmployeeSummaryWidgetComponent,
  ],
  animations: [CARD_STAGGER],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './employee-profile-hub.component.html',
  styleUrl: './employee-profile-hub.component.scss',
})
export class EmployeeProfileHubComponent implements OnInit, OnDestroy {
  protected readonly store = inject(WorkforceWdoStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected employeeId = 0;

  protected readonly isDarkMode = signal<boolean>(
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('aoms-dark')
  );

  ngOnInit(): void {
    this.employeeId = parseInt(this.route.snapshot.paramMap.get('id') ?? '0', 10);
    if (!this.employeeId) {
      this.router.navigate([WDO_BASE, 'inventory-dashboard']);
      return;
    }
    this.store.fetchProfile(this.employeeId);
  }

  ngOnDestroy(): void {
    this.store.clearProfile();
  }

  // ── Navigation ──────────────────────────────────────────────────────
  protected goBack(): void {
    this.router.navigate([WDO_BASE, 'inventory-dashboard']);
  }

  protected toggleDarkMode(): void {
    const next = !this.isDarkMode();
    document.documentElement.classList.toggle('aoms-dark', next);
    this.isDarkMode.set(next);
  }

  // ── Salary ──────────────────────────────────────────────────────────
  protected async onSalarySaved(update: ISalaryUpdate): Promise<void> {
    await this.store.adjustSalary(this.employeeId, update.newSalary, update.reason);
  }

  // ── Status Toggle ───────────────────────────────────────────────────
  protected async onDeactivateConfirmed(): Promise<void> {
    await this.store.toggleStatus(this.employeeId, false);
  }

  protected async onReactivateConfirmed(): Promise<void> {
    await this.store.toggleStatus(this.employeeId, true);
  }

  protected dismissError(): void {
    this.store.clearHrActionState();
  }
}