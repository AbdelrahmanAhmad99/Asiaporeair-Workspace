// ============================================================================
// saved-passengers.component.ts
// Asiaporeair | Smart Page — "Travel Companions Hub"
// ============================================================================

import {
  Component, OnInit, OnDestroy,
  ChangeDetectionStrategy, inject, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import {
  trigger, transition, style, animate, query, stagger
} from '@angular/animations';
import { Subject, takeUntil, finalize, catchError, of } from 'rxjs';

import { ProfileStore } from '../../../store/profile.store';
import { PassengersService } from '@shared-core';
import { IPassengerDto, IUpdatePassengerDto } from '@shared-core';

// ── Dumb components ──────────────────────────────────────────────────────────
import { PassengerSummaryCardComponent } from '../../components/passenger-summary-card/passenger-summary-card.component';
import {
  AddPassengerModalComponent,
  IPassengerFormValue
} from '../../components/add-passenger-modal/add-passenger-modal.component';

// ── Quick-nav links ───────────────────────────────────────────────────────────
interface IQuickNavLink {
  label: string;
  route: string;
  icon: string;
}

// ── Page Animations ───────────────────────────────────────────────────────────
const PAGE_ANIMATIONS = [
  trigger('pageEnter', [
    transition(':enter', [
      query('.sp-animate', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        stagger(70, [
          animate('480ms cubic-bezier(0.22, 1, 0.36, 1)',
            style({ opacity: 1, transform: 'translateY(0)' }))
        ])
      ], { optional: true })
    ])
  ]),
  trigger('fadeUp', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateY(14px)' }),
      animate('420ms cubic-bezier(0.22, 1, 0.36, 1)',
        style({ opacity: 1, transform: 'translateY(0)' }))
    ])
  ]),
  trigger('cardGrid', [
    transition('* => *', [
      query(':enter', [
        style({ opacity: 0, transform: 'translateY(16px)' }),
        stagger(60, [
          animate('380ms cubic-bezier(0.22, 1, 0.36, 1)',
            style({ opacity: 1, transform: 'translateY(0)' }))
        ])
      ], { optional: true })
    ])
  ])
];

@Component({
  selector: 'app-saved-passengers',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    PassengerSummaryCardComponent,
    AddPassengerModalComponent
  ],
  animations: PAGE_ANIMATIONS,
  templateUrl: './saved-passengers.component.html',
  styleUrls: ['./saved-passengers.component.scss']
})
export class SavedPassengersComponent implements OnInit, OnDestroy {

  // ── DI ────────────────────────────────────────────────────────────────
  readonly store = inject(ProfileStore);
  private readonly router = inject(Router);
  private readonly passSvc = inject(PassengersService);
  private readonly destroy$ = new Subject<void>();

  // ── Modal state ───────────────────────────────────────────────────────
  readonly isModalOpen = signal<boolean>(false);
  readonly editingPassenger = signal<IPassengerDto | null>(null);

  // ── Quick nav links ───────────────────────────────────────────────────
  readonly quickNavLinks: IQuickNavLink[] = [
    {
      label: 'Personal Information',
      route: '/profile/personal-info',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`
    },
    {
      label: 'My Trips',
      route: '/manage-booking/my-trips',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M5.34 18.66l-1.41 1.41M16.95 16.95l1.41 1.41M4.93 4.93l1.41 1.41M12 2v2M12 20v2M2 12h2M20 12h2"/></svg>`
    },
    {
      label: 'Loyalty Dashboard',
      route: '/loyalty/loyalty-dashboard',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>`
    },
    {
      label: 'Account Security',
      route: '/profile/account-security',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`
    }
  ];

  // ── Lifecycle ─────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.store.loadSavedPassengers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Modal Controls ────────────────────────────────────────────────────

  openAddModal(): void {
    this.editingPassenger.set(null);
    this.isModalOpen.set(true);
  }

  openEditModal(passenger: IPassengerDto): void {
    this.editingPassenger.set(passenger);
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.editingPassenger.set(null);
  }

  // ── Form Submit ───────────────────────────────────────────────────────

  onModalSubmit(formValue: IPassengerFormValue): void {
    const editing = this.editingPassenger();

    if (editing) {
      // ── Edit mode ─────────────────────────────────────────────────────
      const dto: IUpdatePassengerDto = {
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        dateOfBirth: formValue.dateOfBirth || null,
        passportNumber: formValue.passportNumber || null
      };

      this.store.updatePassenger(
        editing.passengerId,
        dto,
        () => this.closeModal(),
        () => { /* Error toast can be wired here */ }
      );

    } else {
      // ── Add mode ──────────────────────────────────────────────────────
      // NOTE: The PassengersService does not yet expose a createPassenger endpoint.
      // When it does, replace this optimistic append with an API call.
      const optimistic: IPassengerDto = {
        passengerId: Date.now(),          // temp ID
        linkedUserId: 0,
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        dateOfBirth: formValue.dateOfBirth || null,
        passportNumber: formValue.passportNumber || null,
        frequentFlyerCardNumber: null
      };
      this.store.appendPassenger(optimistic);
      this.closeModal();
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────

  onDeletePassenger(passengerId: number): void {
    this.store.deletePassenger(passengerId);
  }

  // ── Helpers ───────────────────────────────────────────────────────────

  isDeletingThisPassenger(passengerId: number): boolean {
    return this.store.isDeletingPassenger() === passengerId;
  }

  trackById(_: number, p: IPassengerDto): number {
    return p.passengerId;
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}