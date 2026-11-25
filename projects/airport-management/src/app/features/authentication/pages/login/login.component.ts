
import {
  Component, inject, ChangeDetectionStrategy, OnDestroy, OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

import { AuthService } from '../../services/auth.service';
import { AuthStore } from '../../store/auth.store';
import { AuthStateService } from '../../../../core/auth/auth-state.service';
import { AuthSessionResponse } from '../../../../core/auth/session.model';
import { AnyUserProfileDto } from '../../models/auth.model';

import { AuthLayoutHeaderComponent } from '../../components/auth-layout-header/auth-layout-header.component';
import { AuthLayoutFooterComponent } from '../../components/auth-layout-footer/auth-layout-footer.component';
import { LoginFormComponent, LoginFormValue } from '../../components/login-form/login-form.component';
import { SocialLoginButtonsComponent } from '../../components/social-login-buttons/social-login-buttons.component';

@Component({
  selector: 'app-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    AuthLayoutHeaderComponent,
    AuthLayoutFooterComponent,
    LoginFormComponent,
    SocialLoginButtonsComponent,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {

  readonly store = inject(AuthStore);
  private readonly authService = inject(AuthService);
  private readonly authState = inject(AuthStateService);
  private readonly router = inject(Router);
  private readonly destroy$ = new Subject<void>();

  // ── Lifecycle ───────────────────────────────────────────────────────────────

  ngOnInit(): void {
    // If the user already has a valid session, skip login and jump to their dashboard
    if (this.authState.isAuthenticated() && this.authState.userRole() !== null) {
      this.authService.redirectBasedOnRole(this.authState.userRole()!);
    }
  }

  // ── Event handlers ──────────────────────────────────────────────────────────

  onSubmit(credentials: LoginFormValue): void {
    this.store.startLoading();

    this.authService
      .login({ email: credentials.email, password: credentials.password })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (session: AuthSessionResponse) => {
          const profile = session.userProfile as unknown as AnyUserProfileDto;
          this.store.setSessionData(session.token, profile);
          // AuthService.login() already calls redirectBasedOnRole() via its tap()
        },
        error: (err: HttpErrorResponse) => {
          const message = this.extractErrorMessage(err);
          this.store.onLoginError(message);
        },
      });
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  private extractErrorMessage(err: HttpErrorResponse): string {
    if (err.status === 401) return 'Invalid email or password. Please try again.';
    if (err.status === 403) return 'Your account has been suspended. Please contact support.';
    if (err.status === 0) return 'Unable to reach the server. Please check your connection.';
    return err.error?.message ?? err.error?.errors?.[0] ?? 'Sign-in failed. Please try again.';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.store.resetState();
  }
}