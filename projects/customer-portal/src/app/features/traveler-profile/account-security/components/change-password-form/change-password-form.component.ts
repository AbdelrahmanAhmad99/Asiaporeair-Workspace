// ============================================================================
// change-password-form.component.ts
// Asiaporeair | Dumb Component — Change Password Form
// ============================================================================

import {
  Component, Input, Output, EventEmitter,
  ChangeDetectionStrategy, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule, FormBuilder, FormGroup,
  Validators, AbstractControl, ValidationErrors
} from '@angular/forms';
import { ProfileSaveState } from '../../../store/profile.store';

export interface IChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

// Custom cross-field validator
function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const newPwd = group.get('newPassword')?.value;
  const confirmPwd = group.get('confirmPassword')?.value;
  return newPwd && confirmPwd && newPwd !== confirmPwd
    ? { passwordMismatch: true }
    : null;
}

// Password strength levels
type PasswordStrength = 'none' | 'weak' | 'fair' | 'strong' | 'very-strong';

function measureStrength(password: string): PasswordStrength {
  if (!password) return 'none';
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) return 'weak';
  if (score === 2) return 'fair';
  if (score === 3) return 'strong';
  return 'very-strong';
}

@Component({
  selector: 'app-change-password-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './change-password-form.component.html',
  styleUrls: ['./change-password-form.component.scss']
})
export class ChangePasswordFormComponent {

  @Input() isSaving: boolean = false;
  @Input() saveState: ProfileSaveState = 'idle';
  @Output() formSave = new EventEmitter<IChangePasswordPayload>();

  readonly form: FormGroup;

  // Individual show/hide toggles for each field
  readonly showOld = signal<boolean>(false);
  readonly showNew = signal<boolean>(false);
  readonly showConfirm = signal<boolean>(false);

  readonly passwordStrength = signal<PasswordStrength>('none');

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      oldPassword: ['', [Validators.required, Validators.minLength(8)]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: passwordMatchValidator });

    // React to new password input for strength meter
    this.form.get('newPassword')?.valueChanges.subscribe(val => {
      this.passwordStrength.set(measureStrength(val ?? ''));
    });
  }

  onSubmit(): void {
    if (this.form.invalid || this.isSaving) return;
    this.formSave.emit({
      oldPassword: this.form.value.oldPassword,
      newPassword: this.form.value.newPassword
    });
    this.form.reset();
    this.passwordStrength.set('none');
  }

  toggle(field: 'old' | 'new' | 'confirm'): void {
    if (field === 'old') this.showOld.update(v => !v);
    if (field === 'new') this.showNew.update(v => !v);
    if (field === 'confirm') this.showConfirm.update(v => !v);
  }

  hasError(field: string, error: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.touched && ctrl?.hasError(error));
  }

  hasFormError(error: string): boolean {
    return !!(this.form.touched && this.form.hasError(error));
  }

  hasValue(field: string): boolean {
    return !!(this.form.get(field)?.value);
  }

  get strengthLabel(): string {
    const map: Record<PasswordStrength, string> = {
      'none': '', 'weak': 'Weak', 'fair': 'Fair', 'strong': 'Strong', 'very-strong': 'Very Strong'
    };
    return map[this.passwordStrength()];
  }
}