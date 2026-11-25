
import {
  ChangeDetectionStrategy,
  Component,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { IFareBasisCodeDto } from '@shared-core';

// ── Public form value contract shared with parent + preview ───────────────
export interface IFarePolicyFormValue {
  code: string;
  description: string;
  rules: string;
}

@Component({
  selector: 'aoms-fare-policy-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './fare-policy-form.component.html',
  styleUrl: './fare-policy-form.component.scss',
})
export class FarePolicyFormComponent implements OnInit, OnChanges, OnDestroy {
  private readonly fb = inject(FormBuilder);

  // ── Inputs ──────────────────────────────────────────────────────────────
  readonly initialFare = input<IFareBasisCodeDto | null>(null);
  readonly isLoading = input<boolean>(false);
  readonly isSaving = input<boolean>(false);
  readonly isEditMode = input<boolean>(false);

  // ── Outputs ─────────────────────────────────────────────────────────────
  readonly valueChanged = output<IFarePolicyFormValue>();
  readonly saveRequested = output<IFarePolicyFormValue>();
  readonly cancelRequested = output<void>();

  // ── Form ─────────────────────────────────────────────────────────────────
  protected form!: FormGroup;

  /** Which section is currently expanded (slide transition). */
  protected readonly activeSection = signal<1 | 2>(1);

  /** Tracks whether the form has been submitted (to show all errors). */
  protected readonly submitted = signal<boolean>(false);

  private readonly _destroy$ = new Subject<void>();

  // ── Skeleton rows for loading state ───────────────────────────────────
  protected readonly skeletonFields = [1, 2, 3];

  ngOnInit(): void {
    this._buildForm();
    this._subscribeToValueChanges();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // When initialFare arrives (edit mode fetch completes), patch into form
    if (changes['initialFare'] && this.form) {
      const fare = this.initialFare();
      if (fare) {
        this.form.patchValue({
          code: fare.code,
          description: fare.description ?? '',
          rules: fare.rules ?? '',
        });
        // Emit immediately so preview shows the loaded data
        this.valueChanged.emit(this.form.getRawValue() as IFarePolicyFormValue);
      }
    }
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  // ── Section Navigation ─────────────────────────────────────────────────
  protected navigateTo(section: 1 | 2): void {
    this.activeSection.set(section);
  }

  // ── Submit ─────────────────────────────────────────────────────────────
  protected onSubmit(): void {
    this.submitted.set(true);
    if (this.form.invalid) return;
    this.saveRequested.emit(this.form.getRawValue() as IFarePolicyFormValue);
  }

  protected onCancel(): void {
    this.cancelRequested.emit();
  }

  // ── Validation helpers ─────────────────────────────────────────────────
  protected isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!ctrl && ctrl.invalid && (ctrl.touched || this.submitted());
  }

  protected getError(field: string): string {
    const ctrl = this.form.get(field);
    if (!ctrl?.errors) return '';
    if (ctrl.errors['required']) return 'This field is required.';
    if (ctrl.errors['minlength']) {
      return `Minimum ${ctrl.errors['minlength'].requiredLength} characters required.`;
    }
    if (ctrl.errors['maxlength']) {
      return `Maximum ${ctrl.errors['maxlength'].requiredLength} characters allowed.`;
    }
    if (ctrl.errors['pattern']) return 'Only uppercase letters and numbers are permitted.';
    return 'Invalid value.';
  }

  // ── Private ────────────────────────────────────────────────────────────

  private _buildForm(): void {
    this.form = this.fb.group({
      code: [
        { value: '', disabled: this.isEditMode() },
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(10),
          Validators.pattern(/^[A-Z0-9]+$/),
        ],
      ],
      description: [
        '',
        [Validators.required, Validators.minLength(3), Validators.maxLength(200)],
      ],
      rules: [
        '',
        [Validators.required, Validators.minLength(10), Validators.maxLength(2000)],
      ],
    });
  }

  private _subscribeToValueChanges(): void {
    this.form.get('code')?.valueChanges
      .pipe(takeUntil(this._destroy$))
      .subscribe((val: string) => {
        if (val) {
          const upper = val.toUpperCase();
          if (upper !== val) {
            this.form.get('code')?.setValue(upper, { emitEvent: false });
          }
        }
      });

    this.form.valueChanges
      .pipe(takeUntil(this._destroy$))
      .subscribe(() => {
        this.valueChanged.emit(this.form.getRawValue() as IFarePolicyFormValue);
      });
  }
}