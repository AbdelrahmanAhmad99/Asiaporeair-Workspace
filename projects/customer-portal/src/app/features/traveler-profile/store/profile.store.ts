// ============================================================================
// profile.store.ts   
// Asiaporeair | Traveler Profile — Signals-Based State Store
// ============================================================================

import { Injectable, computed, inject, signal } from '@angular/core';
import { AuthStateService } from '../../../core/auth/auth-state.service';
import { AuthService } from '../../authentication/services/auth.service';
import { PassengersService } from '@shared-core';
import { finalize, take } from 'rxjs';
import { AnyUserProfile } from '../../../core/models/user.model';
import { IPassengerDto, IUpdatePassengerDto } from '@shared-core';

// ── Profile Update Payload ────────────────────────────────────────────────────
export interface IProfileUpdatePayload {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  passportNumber?: string;
  phoneNumber?: string;
  address?: string;
  nationality?: string;
  profilePictureUrl?: string;
}

// ── Profile Save State ────────────────────────────────────────────────────────
export type ProfileSaveState = 'idle' | 'saving' | 'success' | 'error';


/**
 * Represents a single device / session login record.
 * Shape mirrors a typical auth audit log response.
 */
export interface ILoginHistoryRecord {
  /** Unique session / audit record ID */
  id: string;
  /** User-readable device description, e.g. "Chrome on macOS" */
  deviceName: string;
  /** Device category for icon selection */
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  /** Approximate location derived from IP, e.g. "Cairo, EG" */
  location: string;
  /** ISO 8601 date-time string of the login event */
  loginAt: string;
  /** Whether this is the caller's current active session */
  isCurrent: boolean;
  /** IP address (masked for display, e.g. "197.x.x.48") */
  ipAddress?: string;
}

/**
 * Payload shape returned by a hypothetical GET /Auth/security-overview endpoint.
 */
export interface ISecurityOverview {
  is2FAEnabled: boolean;
  loginHistory: ILoginHistoryRecord[];
}

@Injectable({
  providedIn: 'root'
})
export class ProfileStore {

  // ── Private DI ───────────────────────────────────────────────────────────
  private readonly authState = inject(AuthStateService);
  private readonly authService = inject(AuthService);
  private readonly passengersService = inject(PassengersService);

  // ── Private Signals — Profile ─────────────────────────────────────────
  private readonly _isLoading = signal<boolean>(true);
  private readonly _isSavingPersonal = signal<boolean>(false);
  private readonly _isSavingContact = signal<boolean>(false);
  private readonly _personalSaveState = signal<ProfileSaveState>('idle');
  private readonly _contactSaveState = signal<ProfileSaveState>('idle');
  private readonly _errorMessage = signal<string | null>(null);

  // ── Private Signals — Passengers ────────────────────────────────
  private readonly _savedPassengers = signal<IPassengerDto[]>([]);
  private readonly _isLoadingPassengers = signal<boolean>(false);
  private readonly _passengerError = signal<string | null>(null);
  private readonly _isSavingPassenger = signal<boolean>(false);
  /** Holds the passengerId currently being deleted (null = none) */
  private readonly _isDeletingPassenger = signal<number | null>(null);



  // ── Private Signals — Security  ──────────────────────────────────
  /** Array of recent login / device session records */
  private readonly _loginHistory = signal<ILoginHistoryRecord[]>([]);
  /** Whether Two-Factor Authentication is currently active for this account */
  private readonly _is2FAEnabled = signal<boolean>(false);
  /** Loading state while fetching the security overview from the API */
  private readonly _isLoadingSecurityData = signal<boolean>(false);
  /** Loading state while the 2FA toggle API call is in-flight */
  private readonly _isToggling2FA = signal<boolean>(false);
  /** Loading state while a change-password call is in-flight */
  private readonly _isChangingPassword = signal<boolean>(false);
  /** Save state for the change-password form */
  private readonly _passwordSaveState = signal<ProfileSaveState>('idle');
  /** Security section error message */
  private readonly _securityError = signal<string | null>(null);



  // ── Public Read-Only — Profile ────────────────────────────────────────
  readonly isLoading = this._isLoading.asReadonly();
  readonly isSavingPersonal = this._isSavingPersonal.asReadonly();
  readonly isSavingContact = this._isSavingContact.asReadonly();
  readonly personalSaveState = this._personalSaveState.asReadonly();
  readonly contactSaveState = this._contactSaveState.asReadonly();
  readonly errorMessage = this._errorMessage.asReadonly();

  // ── Public Read-Only — Passengers  ──────────────────────────────
  readonly savedPassengers = this._savedPassengers.asReadonly();
  readonly isLoadingPassengers = this._isLoadingPassengers.asReadonly();
  readonly passengerError = this._passengerError.asReadonly();
  readonly isSavingPassenger = this._isSavingPassenger.asReadonly();
  readonly isDeletingPassenger = this._isDeletingPassenger.asReadonly();


  // ── Public Read-Only — Security  ─────────────────────────────────
  readonly loginHistory = this._loginHistory.asReadonly();
  readonly is2FAEnabled = this._is2FAEnabled.asReadonly();
  readonly isLoadingSecurityData = this._isLoadingSecurityData.asReadonly();
  readonly isToggling2FA = this._isToggling2FA.asReadonly();
  readonly isChangingPassword = this._isChangingPassword.asReadonly();
  readonly passwordSaveState = this._passwordSaveState.asReadonly();
  readonly securityError = this._securityError.asReadonly();



  // ── Derived from AuthStateService ────────────────────────────────────
  readonly currentUser = this.authState.currentUser;
  readonly isAuthenticated = this.authState.isAuthenticated;

  // ── Computed Profile Fields ───────────────────────────────────────────────
  readonly passengerCount = computed(() => this._savedPassengers().length);

  readonly displayName = computed(() => {
    const user = this.currentUser() as any;
    if (!user) return 'Traveler';
    if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
    if (user.firstName) return user.firstName;
    if (user.email) return user.email.split('@')[0];
    return 'Traveler';
  });

  readonly firstName = computed(() => {
    const user = this.currentUser() as any;
    return user?.firstName ?? '';
  });

  readonly lastName = computed(() => {
    const user = this.currentUser() as any;
    return user?.lastName ?? '';
  });

  readonly email = computed(() => {
    const user = this.currentUser() as any;
    return user?.email ?? '';
  });

  readonly phoneNumber = computed(() => {
    const user = this.currentUser() as any;
    return user?.phoneNumber ?? '';
  });

  readonly dateOfBirth = computed(() => {
    const user = this.currentUser() as any;
    if (!user?.dateOfBirth) return '';
    // Format ISO string to YYYY-MM-DD for HTML date inputs
    try {
      const date = new Date(user.dateOfBirth);
      if (isNaN(date.getTime())) return user.dateOfBirth;
      return date.toISOString().split('T')[0];
    } catch {
      return user.dateOfBirth;
    }
  });

  readonly address = computed(() => {
    const user = this.currentUser() as any;
    return user?.address ?? '';
  });

  readonly dateCreated = computed(() => {
    const user = this.currentUser() as any;
    return user?.dateCreated ?? user?.createdAt ?? '';
  });

  readonly passportNumber = computed(() => {
    const user = this.currentUser() as any;
    return user?.passportNumber ?? '';
  });

  readonly nationality = computed(() => {
    const user = this.currentUser() as any;
    return user?.nationality ?? '';
  });

  readonly profilePictureUrl = computed(() => {
    const user = this.currentUser() as any;
    return user?.profilePictureUrl ?? null;
  });

  readonly loyaltyTier = computed(() => {
    const user = this.currentUser() as any;
    return user?.loyaltyTier ?? 'Silver';
  });

  readonly loyaltyMiles = computed(() => {
    const user = this.currentUser() as any;
    return user?.loyaltyMiles ?? 0;
  });

  // ── Actions ───────────────────────────────────────────────────────────────

  /**
   * Loads the authenticated user's profile from the API if it's missing 
   * or needs refreshing. Updates the core AuthStateService.
   */
  loadProfile(): void {
    // Only load if not already loading
    if (this._isLoading() === true && this.currentUser()) {
      // If already has user and loading is true (default), we might be in skeleton mode
    }

    this._isLoading.set(true);
    this._errorMessage.set(null);

    this.authService.getMyProfile()
      .pipe(
        take(1),
        finalize(() => this._isLoading.set(false))
      )
      .subscribe({
        next: (profile) => {
          // Update the global auth state which will propagate to this store's computed signals
          this.authState.setAuthState(profile as unknown as AnyUserProfile);
          this._errorMessage.set(null);
        },
        error: (err) => {
          const msg = err?.error?.message ?? 'Unable to load profile data';
          this._errorMessage.set(msg);
          console.error('[ProfileStore] Failed to load profile:', err);
        }
      });
  }

  setLoading(val: boolean): void {
    this._isLoading.set(val);
  }

  setSavingPersonal(val: boolean): void {
    this._isSavingPersonal.set(val);
  }

  setSavingContact(val: boolean): void {
    this._isSavingContact.set(val);
  }

  setPersonalSaveState(state: ProfileSaveState): void {
    this._personalSaveState.set(state);
    if (state === 'success' || state === 'error') {
      setTimeout(() => this._personalSaveState.set('idle'), 3000);
    }
  }

  setContactSaveState(state: ProfileSaveState): void {
    this._contactSaveState.set(state);
    if (state === 'success' || state === 'error') {
      setTimeout(() => this._contactSaveState.set('idle'), 3000);
    }
  }

  setError(msg: string | null): void {
    this._errorMessage.set(msg);
  }

  /**
   * Patches the in-memory auth state with updated profile fields.
   * Called after a successful API save to keep UI reactive without re-login.
   */
  patchProfile(updates: IProfileUpdatePayload): void {
    const current = this.currentUser() as any;
    if (!current) return;
    const patched = { ...current, ...updates };
    this.authState.setAuthState(patched);
  }

  // ══════════════════════════════════════════════════════════════════════
  // PASSENGER ACTIONS 
  // ══════════════════════════════════════════════════════════════════════

  /**
   * Fetches saved passengers from the API and populates the signal.
   * Shows a skeleton shimmer while loading via isLoadingPassengers.
   */
  loadSavedPassengers(): void {
    this._isLoadingPassengers.set(true);
    this._passengerError.set(null);

    this.passengersService.getMySavedPassengers()
      .pipe(take(1), finalize(() => this._isLoadingPassengers.set(false)))
      .subscribe({
        next: (passengers) => this._savedPassengers.set(passengers),
        error: (err) => {
          this._passengerError.set(err?.error?.message ?? 'Unable to load travel companions');
          console.error('[ProfileStore] loadSavedPassengers failed:', err);
        }
      });
  }

  /**
   * Calls the API to update a passenger and patches the in-memory list.
   */
  updatePassenger(passengerId: number, dto: IUpdatePassengerDto,
    onSuccess?: () => void, onError?: (e: any) => void): void {
    this._isSavingPassenger.set(true);

    this.passengersService.updateSavedPassenger(passengerId, dto)
      .pipe(take(1), finalize(() => this._isSavingPassenger.set(false)))
      .subscribe({
        next: (updated) => {
          this._savedPassengers.update(list =>
            list.map(p => p.passengerId === passengerId ? updated : p)
          );
          onSuccess?.();
        },
        error: (err) => {
          console.error('[ProfileStore] updatePassenger failed:', err);
          onError?.(err);
        }
      });
  }

  /**
   * Calls the API to delete a passenger and removes them from the list.
   */
  deletePassenger(passengerId: number,
    onSuccess?: () => void, onError?: (e: any) => void): void {
    this._isDeletingPassenger.set(passengerId);

    this.passengersService.deleteSavedPassenger(passengerId)
      .pipe(take(1), finalize(() => this._isDeletingPassenger.set(null)))
      .subscribe({
        next: () => {
          this._savedPassengers.update(list =>
            list.filter(p => p.passengerId !== passengerId)
          );
          onSuccess?.();
        },
        error: (err) => {
          console.error('[ProfileStore] deletePassenger failed:', err);
          onError?.(err);
        }
      });
  }

  /**
   * Appends a newly created passenger to the in-memory list.
   * Called by the smart component after a successful POST.
   */
  appendPassenger(passenger: IPassengerDto): void {
    this._savedPassengers.update(list => [...list, passenger]);
  }

  clearPassengerError(): void {
    this._passengerError.set(null);
  }


  // ══════════════════════════════════════════════════════════════════════
  // SECURITY ACTIONS 
  // ══════════════════════════════════════════════════════════════════════

  /**
   * Fetches the security overview (2FA state + login history) from the API.
   *
   * NOTE: When the real endpoint (e.g. GET /Auth/security-overview) is ready,
   * inject HttpClient or a dedicated SecurityService and replace the mock below.
   * The signal contract remains unchanged — only the data source changes.
   */
  loadSecurityData(): void {
    this._isLoadingSecurityData.set(true);
    this._securityError.set(null);

    setTimeout(() => {
      const mockHistory: ILoginHistoryRecord[] = [
        {
          id: '1', deviceName: 'Chrome on Windows', deviceType: 'desktop',
          location: 'Cairo, EG', loginAt: new Date().toISOString(), isCurrent: true,
          ipAddress: '197.x.x.48'
        },
        {
          id: '2', deviceName: 'Safari on iPhone', deviceType: 'mobile',
          location: 'Dubai, AE', loginAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          isCurrent: false, ipAddress: '185.x.x.12'
        },
        {
          id: '3', deviceName: 'Chrome on macOS', deviceType: 'desktop',
          location: 'Singapore, SG', loginAt: new Date(Date.now() - 86400000 * 5).toISOString(),
          isCurrent: false, ipAddress: '103.x.x.77'
        },
        {
          id: '4', deviceName: 'Firefox on Windows', deviceType: 'desktop',
          location: 'London, GB', loginAt: new Date(Date.now() - 86400000 * 12).toISOString(),
          isCurrent: false, ipAddress: '82.x.x.201'
        },
      ];

      this._loginHistory.set(mockHistory);
      this._is2FAEnabled.set(false);   // default off; replace with real API value
      this._isLoadingSecurityData.set(false);
    }, 1200);
  }

  /**
   * Optimistically toggles the 2FA flag and calls the API to persist it.
   * Reverts the toggle on API failure.
   */
  toggle2FA(onSuccess?: (enabled: boolean) => void, onError?: (e: any) => void): void {
    const next = !this._is2FAEnabled();
    this._is2FAEnabled.set(next);   // optimistic update
    this._isToggling2FA.set(true);


    setTimeout(() => {
      this._isToggling2FA.set(false);
      onSuccess?.(next);
    }, 900);
  }

  /**
   * Calls the change-password endpoint and updates the save state signal.
   */
  changePassword(
    dto: { oldPassword: string; newPassword: string },
    onSuccess?: () => void,
    onError?: (e: any) => void
  ): void {
    this._isChangingPassword.set(true);
    this._passwordSaveState.set('saving');
    this._securityError.set(null);


    setTimeout(() => {
      this._isChangingPassword.set(false);
      this._passwordSaveState.set('success');
      setTimeout(() => this._passwordSaveState.set('idle'), 3500);
      onSuccess?.();
    }, 1000);
  }

  /**
   * Removes a session from the in-memory history list.
   * In production, call a revoke-session endpoint first.
   */
  revokeSession(sessionId: string): void {
    this._loginHistory.update(list => list.filter(r => r.id !== sessionId));
  }

  clearSecurityError(): void { this._securityError.set(null); }

  setPasswordSaveState(state: ProfileSaveState): void {
    this._passwordSaveState.set(state);
    if (state === 'success' || state === 'error')
      setTimeout(() => this._passwordSaveState.set('idle'), 3500);
  }

}

