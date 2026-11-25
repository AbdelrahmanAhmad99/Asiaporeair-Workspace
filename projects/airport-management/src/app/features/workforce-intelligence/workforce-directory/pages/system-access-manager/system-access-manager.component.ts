
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  animate, style, transition, trigger,
} from '@angular/animations';

import { WorkforceWdoStore } from '../../store/workforce-wdo.store';
import { IdentityViewerComponent } from '../../components/identity-viewer/identity-viewer.component';
import { TechnicalAccessFormComponent } from '../../components/technical-access-form/technical-access-form.component';
import { TechnicalRole, IProfileUpdatePayload } from '../../store/workforce-wdo.store';

const WDO_BASE = 'aoms/workforce-intelligence/workforce-directory';

const VALID_ROLES: TechnicalRole[] = ['superadmin', 'admin', 'supervisor', 'pilot', 'attendant'];

const SAM_ANIMATIONS = [
  trigger('pageEnter', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateY(12px)' }),
      animate('350ms 40ms cubic-bezier(0.4,0,0.2,1)',
        style({ opacity: 1, transform: 'translateY(0)' })),
    ]),
  ]),
  trigger('toastIn', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateY(-8px)' }),
      animate('260ms cubic-bezier(0.16,1,0.3,1)',
        style({ opacity: 1, transform: 'translateY(0)' })),
    ]),
    transition(':leave', [
      animate('180ms ease-in',
        style({ opacity: 0, transform: 'translateY(-6px)' })),
    ]),
  ]),
];

@Component({
  selector: 'aoms-system-access-manager',
  standalone: true,
  imports: [
    CommonModule,
    IdentityViewerComponent,
    TechnicalAccessFormComponent,
  ],
  animations: SAM_ANIMATIONS,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './system-access-manager.component.html',
  styleUrl: './system-access-manager.component.scss',
})
export class SystemAccessManagerComponent implements OnInit, OnDestroy {
  protected readonly store = inject(WorkforceWdoStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected appUserId: string = '';
  protected activeRole: TechnicalRole = 'admin';

  protected readonly isDarkMode = signal<boolean>(
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('aoms-dark')
  );

  protected readonly roleLabelMap: Record<TechnicalRole, string> = {
    superadmin: 'Super Admin',
    admin: 'Administrator',
    supervisor: 'Supervisor',
    pilot: 'Pilot',
    attendant: 'Cabin Crew',
  };

  protected readonly roleLabel = computed(() =>
    this.roleLabelMap[this.activeRole]
  );

  // ── Are operational dependencies still loading? ─────────────────────
  protected readonly opDepsLoading = computed(() =>
    !this.store.airportsList().length && !this.store.aircraftTypesList().length &&
    (this.activeRole === 'pilot' || this.activeRole === 'attendant')
  );

  ngOnInit(): void {
    this.appUserId = this.route.snapshot.paramMap.get('id') ?? '';
    const rawRole = this.route.snapshot.paramMap.get('role') ?? '';
    this.activeRole = (VALID_ROLES.includes(rawRole as TechnicalRole)
      ? rawRole : 'admin') as TechnicalRole;

    if (!this.appUserId) {
      this.router.navigate([WDO_BASE, 'inventory-dashboard']);
      return;
    }

    this.store.loadTechnicalData(this.appUserId, this.activeRole);
    this.store.fetchOperationalDependencies();
  }

  ngOnDestroy(): void {
    this.store.clearSamState();
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

  // ── Form bridge ─────────────────────────────────────────────────────
  protected async onUpdateSubmitted(payload: IProfileUpdatePayload): Promise<void> {
    await this.store.commitProfileUpdate(payload);
  }

  protected onFormCancelled(): void {
    // Reload original data to reset form
    this.store.loadTechnicalData(this.appUserId, this.activeRole);
    this.store.clearSamError();
  }

  protected dismissError(): void {
    this.store.clearSamError();
  }
}