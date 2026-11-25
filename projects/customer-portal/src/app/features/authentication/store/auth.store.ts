
import { Injectable, computed, signal } from '@angular/core';
import { AnyUserProfileDto } from '../models/auth.model';

export type AuthStep = 'form' | 'success' | 'error';

/**
 * Feature-level signal store for the authentication module.
 * Covers signup, login, forgot-password, and reset-password flows.
 * State slices are additive — earlier flows are never modified.
 */
@Injectable({ providedIn: 'root' })
export class AuthStore {

    // ── [SHARED] Loading / error / step ──────────────────────────────────────────

    private readonly _isLoading = signal(false);
    private readonly _authError = signal<string | null>(null);
    private readonly _authStep = signal<AuthStep>('form');
    private readonly _successMsg = signal<string | null>(null);

    readonly isLoading = this._isLoading.asReadonly();
    readonly authError = this._authError.asReadonly();
    readonly authStep = this._authStep.asReadonly();
    readonly successMsg = this._successMsg.asReadonly();
    readonly hasError = computed(() => this._authError() !== null);
    readonly isSuccess = computed(() => this._authStep() === 'success');

    // ── [LOGIN] Session signals ───────────────────────────────────────────────────

    private readonly _isAuthenticated = signal(false);
    private readonly _accessToken = signal<string | null>(null);
    private readonly _userProfile = signal<AnyUserProfileDto | null>(null);

    readonly isAuthenticated = this._isAuthenticated.asReadonly();
    readonly accessToken = this._accessToken.asReadonly();
    readonly userProfile = this._userProfile.asReadonly();
    /** Backward-compatible alias used by the signup page. */
    readonly currentUser = this._userProfile.asReadonly();

    readonly displayName = computed(() => {
        const u = this._userProfile();
        if (!u) return '';
        return `${u.firstName} ${u.lastName}`.trim() || u.email;
    });

    // ── [FORGOT PASSWORD] Dedicated signals ───────────────────────────────────────

    private readonly _recoveryEmail = signal<string | null>(null);
    private readonly _isForgotLoading = signal(false);
    private readonly _forgotError = signal<string | null>(null);
    private readonly _forgotSuccess = signal(false);
    private readonly _forgotSuccessMsg = signal<string | null>(null);

    readonly recoveryEmail = this._recoveryEmail.asReadonly();
    readonly isForgotLoading = this._isForgotLoading.asReadonly();
    readonly forgotError = this._forgotError.asReadonly();
    readonly forgotSuccess = this._forgotSuccess.asReadonly();
    readonly forgotSuccessMsg = this._forgotSuccessMsg.asReadonly();
    readonly hasForgotError = computed(() => this._forgotError() !== null);

    // ── [RESET PASSWORD] Dedicated signals ────────────────────────────────────────

    private readonly _isResetLoading = signal(false);
    private readonly _resetError = signal<string | null>(null);
    private readonly _resetSuccess = signal(false);
    private readonly _resetSuccessMsg = signal<string | null>(null);

    readonly isResetLoading = this._isResetLoading.asReadonly();
    readonly resetError = this._resetError.asReadonly();
    readonly resetSuccess = this._resetSuccess.asReadonly();
    readonly resetSuccessMsg = this._resetSuccessMsg.asReadonly();
    readonly hasResetError = computed(() => this._resetError() !== null);

    // ============================================================================
    // SIGNUP ACTIONS (unchanged)
    // ============================================================================

    startLoading(): void {
        this._isLoading.set(true);
        this._authError.set(null);
    }

    onSignupSuccess(message: string): void {
        this._isLoading.set(false);
        this._successMsg.set(message);
        this._authStep.set('success');
        this._authError.set(null);
    }

    onSignupError(message: string): void {
        this._isLoading.set(false);
        this._authError.set(message);
        this._authStep.set('error');
    }

    /** @deprecated Use `setSessionData` instead. Kept for backward compatibility. */
    setCurrentUser(user: AnyUserProfileDto): void {
        this._userProfile.set(user);
    }

    // ============================================================================
    // LOGIN ACTIONS (unchanged)
    // ============================================================================

    setSessionData(token: string, profile: AnyUserProfileDto): void {
        this._accessToken.set(token);
        this._userProfile.set(profile);
        this._isAuthenticated.set(true);
        this._isLoading.set(false);
        this._authError.set(null);
        this._authStep.set('success');
    }

    onLoginError(message: string): void {
        this._isLoading.set(false);
        this._authError.set(message);
        this._authStep.set('error');
    }

    clearSession(): void {
        this._isAuthenticated.set(false);
        this._accessToken.set(null);
        this._userProfile.set(null);
    }

    // ============================================================================
    // FORGOT PASSWORD ACTIONS (new)
    // ============================================================================

    startForgotLoading(email: string): void {
        this._isForgotLoading.set(true);
        this._forgotError.set(null);
        this._recoveryEmail.set(email);
    }

    onForgotSuccess(message: string): void {
        this._isForgotLoading.set(false);
        this._forgotSuccessMsg.set(message);
        this._forgotSuccess.set(true);
        this._forgotError.set(null);
    }

    onForgotError(message: string): void {
        this._isForgotLoading.set(false);
        this._forgotError.set(message);
    }

    resetForgotState(): void {
        this._isForgotLoading.set(false);
        this._forgotError.set(null);
        this._forgotSuccess.set(false);
        this._forgotSuccessMsg.set(null);
        this._recoveryEmail.set(null);
    }

    // ============================================================================
    // RESET PASSWORD ACTIONS (new)
    // ============================================================================

    startResetLoading(): void {
        this._isResetLoading.set(true);
        this._resetError.set(null);
    }

    onResetSuccess(message: string): void {
        this._isResetLoading.set(false);
        this._resetSuccessMsg.set(message);
        this._resetSuccess.set(true);
        this._resetError.set(null);
    }

    onResetError(message: string): void {
        this._isResetLoading.set(false);
        this._resetError.set(message);
    }

    resetPasswordState(): void {
        this._isResetLoading.set(false);
        this._resetError.set(null);
        this._resetSuccess.set(false);
        this._resetSuccessMsg.set(null);
    }

    // ============================================================================
    // SHARED RESET
    // ============================================================================

    resetState(): void {
        this._isLoading.set(false);
        this._authError.set(null);
        this._authStep.set('form');
        this._successMsg.set(null);
    }
}

