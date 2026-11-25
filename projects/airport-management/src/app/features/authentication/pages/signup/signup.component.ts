
import {
  Component, inject, ChangeDetectionStrategy, signal, OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { AuthStore } from '../../store/auth.store';
import { UserDto } from '../../models/auth.model';

import { SignupFormComponent, SignupFormValue } from '../../components/signup-form/signup-form.component';
import { SocialLoginButtonsComponent } from '../../components/social-login-buttons/social-login-buttons.component';
import { PasswordStrengthMeterComponent } from '../../components/password-strength-meter/password-strength-meter.component';
import { ProfilePictureUploaderComponent } from '../../components/profile-picture-uploader/profile-picture-uploader.component';
import { AuthLayoutFooterComponent } from '../../components/auth-layout-footer/auth-layout-footer.component';

@Component({
  selector: 'app-signup',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    SignupFormComponent,
    AuthLayoutFooterComponent,
    SocialLoginButtonsComponent,
    PasswordStrengthMeterComponent,
    ProfilePictureUploaderComponent,
  ],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent implements OnDestroy {

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  readonly store = inject(AuthStore);

  /** Tracks the live password for the strength meter. */
  readonly livePassword = signal('');

  /** Holds the profile picture chosen by the user. */
  readonly profilePicture = signal<File | null>(null);

  private readonly destroy$ = new Subject<void>();

  // ── Event handlers ────────────────────────────────────────────────────────

  onPasswordChange(password: string): void {
    this.livePassword.set(password);
  }

  onProfilePictureSelected(file: File): void {
    this.profilePicture.set(file);
  }

  onSubmit(formValue: SignupFormValue): void {
    this.store.startLoading();

    const dto: UserDto = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      email: formValue.email,
      phoneNumber: formValue.phoneNumber ?? '',
      password: formValue.password,
      confirmPassword: formValue.confirmPassword,
      dateOfBirth: formValue.dateOfBirth || undefined,
      address: formValue.address || undefined,
      frequentFlyerId: formValue.frequentFlyerId ? Number(formValue.frequentFlyerId) : undefined,
      krisFlyerTier: formValue.krisFlyerTier || undefined,
      ...(this.profilePicture() ? { profilePicture: this.profilePicture()! } : {}),
    };


    this.authService
      .registerUser(dto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (msg) => this.store.onSignupSuccess(msg),
        error: (err) => {
          const message =
            err?.error?.message ||
            err?.error?.errors?.[0] ||
            'Registration failed. Please try again.';
          this.store.onSignupError(message);
        },
      });
  }

  onGoToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  onGoHome(): void {
    this.router.navigate(['/']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.store.resetState();
  }
}