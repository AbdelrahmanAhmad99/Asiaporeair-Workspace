
import {
  Component, Input, Output, EventEmitter,
  ChangeDetectionStrategy, OnInit, OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

export interface SignupFormValue {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  address?: string;
  frequentFlyerId?: string;
  krisFlyerTier?: string;
  password: string;
  confirmPassword: string;
}

/** Custom cross-field validator: password === confirmPassword */
function passwordMatchValidator(group: AbstractControl): Record<string, boolean> | null {
  const pw = group.get('password')?.value;
  const cpw = group.get('confirmPassword')?.value;
  return pw && cpw && pw !== cpw ? { passwordMismatch: true } : null;
}

@Component({
  selector: 'app-signup-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './signup-form.component.html',
  styleUrls: ['./signup-form.component.scss'],
})
export class SignupFormComponent implements OnInit, OnDestroy {

  @Input() isLoading = false;
  @Output() formSubmit = new EventEmitter<SignupFormValue>();
  @Output() passwordChange = new EventEmitter<string>();

  form!: FormGroup;
  showPassword = false;
  showConfirmPassword = false;

  private readonly destroy$ = new Subject<void>();

  constructor(private readonly fb: FormBuilder) { }

  ngOnInit(): void {
    this.form = this.fb.group(
      {
        firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
        lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
        email: ['', [Validators.required, Validators.email]],
        phoneNumber: ['', [Validators.pattern(/^\+?[0-9\s\-()]{7,20}$/)]],
        dateOfBirth: [''],
        address: [''],
        frequentFlyerId: ['', [Validators.pattern(/^[0-9]+$/)]],
        krisFlyerTier: [''],
        password: [
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

    // Emit password value for the strength meter
    this.form.get('password')!.valueChanges
      .pipe(debounceTime(80), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(val => this.passwordChange.emit(val ?? ''));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
    if (ctrl.errors['minlength']) return `Minimum ${ctrl.errors['minlength'].requiredLength} characters.`;
    if (ctrl.errors['maxlength']) return `Maximum ${ctrl.errors['maxlength'].requiredLength} characters.`;
    if (ctrl.errors['email']) return 'Please enter a valid email address.';
    if (ctrl.errors['pattern']) {
      if (field === 'phoneNumber') return 'Please enter a valid phone number.';
      if (field === 'frequentFlyerId') return 'Must be a numeric ID.';
      return 'Must include uppercase, lowercase, number, and symbol.';
    }
    return 'Invalid value.';
  }

  get mismatch(): boolean {
    return !!(
      this.form.errors?.['passwordMismatch'] &&
      (this.form.get('confirmPassword')?.dirty || this.form.get('confirmPassword')?.touched)
    );
  }

  onSubmit(): void {
    if (this.form.invalid || this.isLoading) {
      this.form.markAllAsTouched();
      return;
    }
    this.formSubmit.emit(this.form.value as SignupFormValue);
  }
}