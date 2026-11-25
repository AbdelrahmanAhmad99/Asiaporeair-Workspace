
import {
  ChangeDetectionStrategy,
  Component,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  inject,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { IAncillaryProduct } from '@shared-core';
import { ANCILLARY_CATEGORIES } from '../../store/ancillary-catalog.store';

// ── Form value contract — Identity section ─────────────────────────────────
export interface IProductIdentityFormValue {
  name: string;
  /** UI-only — not persisted to the backend model. */
  sku: string;
  category: string;
  /** UI-only — not persisted to the backend model. */
  description: string;
}

@Component({
  selector: 'aoms-product-config-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-config-form.component.html',
  styleUrl: './product-config-form.component.scss',
})
export class ProductConfigFormComponent implements OnInit, OnChanges, OnDestroy {
  private readonly fb = inject(FormBuilder);

  // ── Inputs ──────────────────────────────────────────────────────────────
  readonly initialProduct = input<IAncillaryProduct | null>(null);
  readonly isLoading = input<boolean>(false);
  /** External trigger — parent sets true to force validation display. */
  readonly forceValidate = input<boolean>(false);

  // ── Outputs ─────────────────────────────────────────────────────────────
  readonly valueChanged = output<IProductIdentityFormValue>();
  readonly validityChanged = output<boolean>();

  // ── Form ─────────────────────────────────────────────────────────────────
  protected form!: FormGroup;
  protected readonly categories = ANCILLARY_CATEGORIES.filter(c => c.value !== '');
  protected readonly skeletonFields = [1, 2, 3, 4];

  private readonly _destroy$ = new Subject<void>();

  // ── Lifecycle ──────────────────────────────────────────────────────────
  ngOnInit(): void {
    this._buildForm();
    this._subscribeToChanges();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialProduct'] && this.form) {
      const p = this.initialProduct();
      if (p) {
        this.form.patchValue({
          name: p.name,
          category: p.category,
          // sku / description are UI-only — no backend value to hydrate
        }, { emitEvent: false });
        this.valueChanged.emit(this.form.getRawValue() as IProductIdentityFormValue);
        this.validityChanged.emit(this.form.valid);
      }
    }
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  // ── Validation helpers ─────────────────────────────────────────────────
  protected isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!ctrl && ctrl.invalid && (ctrl.touched || this.forceValidate());
  }

  protected getError(field: string): string {
    const ctrl = this.form.get(field);
    if (!ctrl?.errors) return '';
    if (ctrl.errors['required']) return 'This field is required.';
    if (ctrl.errors['minlength']) return `Minimum ${ctrl.errors['minlength'].requiredLength} characters.`;
    if (ctrl.errors['maxlength']) return `Maximum ${ctrl.errors['maxlength'].requiredLength} characters.`;
    if (ctrl.errors['pattern']) return 'Use uppercase letters, numbers, and hyphens only.';
    return 'Invalid value.';
  }

  /** Live character count for the description textarea. */
  protected get descriptionLength(): number {
    return (this.form?.get('description')?.value ?? '').length;
  }

  // ── Private ────────────────────────────────────────────────────────────
  private _buildForm(): void {
    const p = this.initialProduct();
    this.form = this.fb.group({
      name: [
        p?.name ?? '',
        [Validators.required, Validators.minLength(2), Validators.maxLength(80)],
      ],
      sku: [
        '',
        [Validators.maxLength(24), Validators.pattern(/^[A-Z0-9-]*$/)],
      ],
      category: [
        p?.category ?? '',
        [Validators.required],
      ],
      description: [
        '',
        [Validators.maxLength(400)],
      ],
    });
  }

  private _subscribeToChanges(): void {
    this.form.valueChanges
      .pipe(takeUntil(this._destroy$))
      .subscribe(() => {
        this.valueChanged.emit(this.form.getRawValue() as IProductIdentityFormValue);
        this.validityChanged.emit(this.form.valid);
      });
  }
}