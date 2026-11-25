
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  effect,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

/** Flat tax-data shape (future API integration). */
export interface IAirportTaxData {
  landingFeeUsd?: number | null;
  passengerServiceChargeUsd?: number | null;
  securityLevyUsd?: number | null;
  fuelSurchargeMultiplier?: number | null;
}

@Component({
  selector: 'aoms-airport-tax-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './airport-tax-form.component.html',
  styleUrl: './airport-tax-form.component.scss',
})
export class AirportTaxFormComponent implements OnInit {
  // ── Inputs ────────────────────────────────────────────────────────────
  readonly isLoading = input<boolean>(false);
  readonly initialData = input<IAirportTaxData | null>(null);

  // ── Output ────────────────────────────────────────────────────────────
  readonly taxDataChanged = output<IAirportTaxData>();

  // ── Form ──────────────────────────────────────────────────────────────
  protected readonly form: FormGroup;

  // Public accessor for Smart Component read
  get taxFormGroup(): FormGroup { return this.form; }

  constructor(private readonly fb: FormBuilder) {
    this.form = this.fb.group({
      landingFeeUsd: [
        null as number | null,
        [Validators.min(0), Validators.max(999_999)],
      ],
      passengerServiceChargeUsd: [
        null as number | null,
        [Validators.min(0), Validators.max(9_999)],
      ],
      securityLevyUsd: [
        null as number | null,
        [Validators.min(0), Validators.max(9_999)],
      ],
      fuelSurchargeMultiplier: [
        null as number | null,
        [Validators.min(0), Validators.max(2)],
      ],
    });

    // Re-populate if initialData changes (edit mode)
    effect(() => {
      const d = this.initialData();
      if (d) {
        this.form.patchValue(d, { emitEvent: false });
      }
    });
  }

  ngOnInit(): void {
    // Emit whenever the form changes so parent can react
    this.form.valueChanges.subscribe(v => {
      this.taxDataChanged.emit(v as IAirportTaxData);
    });
  }

  protected isInvalid(name: string): boolean {
    const c = this.form.get(name);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }
}