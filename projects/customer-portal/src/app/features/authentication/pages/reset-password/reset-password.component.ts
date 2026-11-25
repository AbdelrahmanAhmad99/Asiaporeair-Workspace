
import {
  Component, inject, ChangeDetectionStrategy, OnInit, OnDestroy, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

import { AuthService } from '../../services/auth.service';
import { AuthStore } from '../../store/auth.store';
import { ResetPasswordDto } from '../../models/auth.model';

import { ResetPasswordFormComponent, ResetPasswordFormValue }
  from '../../components/reset-password-form/reset-password-form.component';
import { SuccessMessageStateComponent }
  from '../../components/success-message-state/success-message-state.component';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    ResetPasswordFormComponent,
    SuccessMessageStateComponent,
  ],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
})
export class ResetPasswordComponent implements OnInit, OnDestroy {

  readonly store = inject(AuthStore);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroy$ = new Subject<void>();

  /** Token and email extracted from the URL query params at init. */
  readonly recoveryToken = signal<string | null>(null);
  readonly recoveryEmail = signal<string | null>(null);
  readonly hasTokenError = signal(false);

  ngOnInit(): void {
    // Extract token + email from query params: /auth/reset-password?token=...&email=...
    const params = this.route.snapshot.queryParamMap;
    const token = params.get('token');
    const email = params.get('email');

    if (!token || !email) {
      this.hasTokenError.set(true);
      return;
    }

    this.recoveryToken.set(token);
    this.recoveryEmail.set(email);
  }

  onSubmit(formValue: ResetPasswordFormValue): void {
    const token = this.recoveryToken();
    const email = this.recoveryEmail();

    if (!token || !email) {
      this.hasTokenError.set(true);
      return;
    }

    this.store.startResetLoading();

    const dto: ResetPasswordDto = {
      email,
      token,
      newPassword: formValue.newPassword,
      confirmPassword: formValue.confirmPassword,
    };

    this.authService
      .resetPassword(dto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (msg) => this.store.onResetSuccess(msg),
        error: (err: HttpErrorResponse) =>
          this.store.onResetError(this.extractMessage(err)),
      });
  }

  private extractMessage(err: HttpErrorResponse): string {
    if (err.status === 0) return 'Unable to reach the server. Please check your connection.';
    if (err.status === 400) return 'This recovery link is invalid or has already been used.';
    if (err.status === 410) return 'This recovery link has expired. Please request a new one.';
    return err.error?.message ?? 'Password reset failed. Please try again.';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.store.resetPasswordState();
  }
}