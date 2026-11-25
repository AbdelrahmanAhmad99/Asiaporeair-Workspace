
import {
  Component, Input, Output, EventEmitter,
  ChangeDetectionStrategy, OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

export interface ForgotPasswordFormValue {
  email: string;
}

@Component({
  selector: 'app-forgot-password-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './forgot-password-form.component.html',
  styleUrls: ['./forgot-password-form.component.scss'],
})
export class ForgotPasswordFormComponent implements OnInit {

  @Input() isLoading = false;
  @Output() formSubmit = new EventEmitter<ForgotPasswordFormValue>();

  form!: FormGroup;

  constructor(private readonly fb: FormBuilder) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  get isInvalid(): boolean {
    const ctrl = this.form.get('email');
    return !!(ctrl?.invalid && (ctrl.dirty || ctrl.touched));
  }

  get errorMessage(): string {
    const ctrl = this.form.get('email');
    if (ctrl?.errors?.['required']) return 'Email address is required.';
    if (ctrl?.errors?.['email']) return 'Please enter a valid email address.';
    return '';
  }

  onSubmit(): void {
    if (this.form.invalid || this.isLoading) {
      this.form.markAllAsTouched();
      return;
    }
    this.formSubmit.emit(this.form.value as ForgotPasswordFormValue);
  }
}