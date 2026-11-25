
import {
  Component, Input, Output, EventEmitter,
  ChangeDetectionStrategy, OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';

export interface ResetPasswordFormValue {
  newPassword: string;
  confirmPassword: string;
}

/** Cross-field validator: newPassword must equal confirmPassword. */
function passwordMatchValidator(group: AbstractControl): Record<string, boolean> | null {
  const pw = group.get('newPassword')?.value as string;
  const cpw = group.get('confirmPassword')?.value as string;
  return pw && cpw && pw !== cpw ? { mismatch: true } : null;
}

@Component({
  selector: 'app-reset-password-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reset-password-form.component.html',
  styleUrls: ['./reset-password-form.component.scss'],
})
export class ResetPasswordFormComponent implements OnInit {

  @Input() isLoading = false;
  @Output() formSubmit = new EventEmitter<ResetPasswordFormValue>();

  form!: FormGroup;
  showNew = false;
  showConfirm = false;

  constructor(private readonly fb: FormBuilder) { }

  ngOnInit(): void {
    this.form = this.fb.group(
      {
        newPassword: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/),
          ],
        ],
        confirmPassword: ['', Validators.required],
      },
      { validators: passwordMatchValidator }
    );
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && (ctrl.dirty || ctrl.touched));
  }

  errorFor(field: string): string {
    const ctrl = this.form.get(field);
    if (!ctrl?.errors) return '';
    if (ctrl.errors['required']) return 'This field is required.';
    if (ctrl.errors['minlength']) return 'Password must be at least 8 characters.';
    if (ctrl.errors['pattern']) return 'Must include uppercase, lowercase, number, and symbol.';
    return '';
  }

  get mismatch(): boolean {
    return !!(
      this.form.errors?.['mismatch'] &&
      (this.form.get('confirmPassword')?.dirty || this.form.get('confirmPassword')?.touched)
    );
  }

  onSubmit(): void {
    if (this.form.invalid || this.isLoading) {
      this.form.markAllAsTouched();
      return;
    }
    this.formSubmit.emit(this.form.value as ResetPasswordFormValue);
  }
}