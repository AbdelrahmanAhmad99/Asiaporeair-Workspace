// ============================================================================
// personal-info.component.ts
// Asiaporeair | Smart Page — "Digital Identity Hub"
// ============================================================================

import {
  Component, OnInit, OnDestroy,
  ChangeDetectionStrategy, inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import {
  trigger, transition, style, animate, query, stagger, state
} from '@angular/animations';
import { Subject, takeUntil, finalize, catchError, of } from 'rxjs';

import { ProfileStore, IProfileUpdatePayload } from '../../../store/profile.store';
import { AuthService } from '../../../../authentication/services/auth.service';

// ── Dumb Components ──────────────────────────────────────────────────────────
import { ProfileAvatarUploaderComponent } from '../../components/profile-avatar-uploader/profile-avatar-uploader.component';
import { PersonalDetailsFormComponent, IPersonalDetailsFormValue } from '../../components/personal-details-form/personal-details-form.component';
import { ContactDetailsFormComponent, IContactDetailsFormValue } from '../../components/contact-details-form/contact-details-form.component';

// ── Profile Nav Links ────────────────────────────────────────────────────────
interface IProfileNavLink {
  label: string;
  route: string;
  icon: string;
  description: string;
}

// ── Page Animations ───────────────────────────────────────────────────────────
const PAGE_ANIMATIONS = [
  trigger('pageEnter', [
    transition(':enter', [
      query('.pi-animate', [
        style({ opacity: 0, transform: 'translateY(24px)' }),
        stagger(80, [
          animate('520ms cubic-bezier(0.22, 1, 0.36, 1)',
            style({ opacity: 1, transform: 'translateY(0)' }))
        ])
      ], { optional: true })
    ])
  ]),
  trigger('fadeUp', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateY(16px)' }),
      animate('460ms cubic-bezier(0.22, 1, 0.36, 1)',
        style({ opacity: 1, transform: 'translateY(0)' }))
    ])
  ])
];

@Component({
  selector: 'app-personal-info',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    ProfileAvatarUploaderComponent,
    PersonalDetailsFormComponent,
    ContactDetailsFormComponent
  ],
  animations: PAGE_ANIMATIONS,
  templateUrl: './personal-info.component.html',
  styleUrls: ['./personal-info.component.scss']
})
export class PersonalInfoComponent implements OnInit, OnDestroy {

  // ── DI ────────────────────────────────────────────────────────────────────
  readonly store = inject(ProfileStore);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroy$ = new Subject<void>();

  // ── Profile Navigation Grid ───────────────────────────────────────────────
  readonly profileNavLinks: IProfileNavLink[] = [
    {
      label: 'Travel Companions',
      route: '/profile/saved-passengers',
      description: 'Manage frequent traveler profiles',
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>`
    },
    {
      label: 'My Trips',
      route: '/manage-booking/my-trips',
      description: 'View and manage your bookings',
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.07 4.93l-1.41 1.41M5.34 18.66l-1.41 1.41M16.95 16.95l1.41 1.41M4.93 4.93l1.41 1.41M12 2v2M12 20v2M2 12h2M20 12h2"/>
      </svg>`
    },
    {
      label: 'Loyalty Dashboard',
      route: '/loyalty/loyalty-dashboard',
      description: 'Cards, wallets & billing info',
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
        <line x1="1" y1="10" x2="23" y2="10"/>
      </svg>`
    },
    {
      label: 'Account Security',
      route: '/profile/account-security',
      description: 'Password, 2FA & login activity',
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>`
    }
  ];

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  ngOnInit(): void {
    // Fetch fresh profile data on component load
    this.store.loadProfile();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Event Handlers ────────────────────────────────────────────────────────

  onAvatarSelected(file: File): void {
    // In production, call authService.updateUserProfile({ profilePicture: file })
    // For now, the dumb component handles preview locally
    console.log('[PersonalInfo] Avatar file selected:', file.name);
  }

  onPersonalDetailsSave(formValue: IPersonalDetailsFormValue): void {
    this.store.setSavingPersonal(true);
    this.store.setPersonalSaveState('saving');

    const payload: IProfileUpdatePayload = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      dateOfBirth: formValue.dateOfBirth,
      address: formValue.address,
      passportNumber: formValue.passportNumber,
      nationality: formValue.nationality
    };

    // API call via AuthService
    this.authService.updateUserProfile(payload as any)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.store.setSavingPersonal(false)),
        catchError(err => {
          this.store.setPersonalSaveState('error');
          this.store.setError('Unable to save personal details. Please try again.');
          return of(null);
        })
      )
      .subscribe(result => {
        if (result !== null) {
          // Patch in-memory state for instant reactivity
          this.store.patchProfile(payload);
          this.store.setPersonalSaveState('success');
        }
      });
  }

  onContactDetailsSave(formValue: IContactDetailsFormValue): void {
    this.store.setSavingContact(true);
    this.store.setContactSaveState('saving');

    const payload: IProfileUpdatePayload = {
      phoneNumber: formValue.phoneNumber
    };

    this.authService.updateUserProfile(payload as any)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.store.setSavingContact(false)),
        catchError(err => {
          this.store.setContactSaveState('error');
          return of(null);
        })
      )
      .subscribe(result => {
        if (result !== null) {
          this.store.patchProfile(payload);
          this.store.setContactSaveState('success');
        }
      });
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  trackByRoute(_: number, link: IProfileNavLink): string {
    return link.route;
  }
}