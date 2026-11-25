
import {
  Component, inject, ChangeDetectionStrategy, OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

import { AuthService } from '../../services/auth.service';
import { AuthStore } from '../../store/auth.store';
import { ForgotPasswordDto } from '../../models/auth.model';

import { ForgotPasswordFormComponent, ForgotPasswordFormValue }
  from '../../components/forgot-password-form/forgot-password-form.component';
import { SuccessMessageStateComponent }
  from '../../components/success-message-state/success-message-state.component';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    ForgotPasswordFormComponent,
    SuccessMessageStateComponent,
  ],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent implements OnDestroy {

  readonly store = inject(AuthStore);
  private readonly authService = inject(AuthService);
  private readonly destroy$ = new Subject<void>();

  onSubmit(formValue: ForgotPasswordFormValue): void {
    this.store.startForgotLoading(formValue.email);

    const dto: ForgotPasswordDto = { email: formValue.email };

    this.authService
      .forgotPassword(dto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (msg) => this.store.onForgotSuccess(msg),
        error: (err: HttpErrorResponse) =>
          this.store.onForgotError(this.extractMessage(err)),
      });
  }

  private extractMessage(err: HttpErrorResponse): string {
    if (err.status === 0) return 'Unable to reach the server. Please check your connection.';
    if (err.status === 404) return 'No account found with that email address.';
    return err.error?.message ?? 'Something went wrong. Please try again.';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.store.resetForgotState();
  }
}