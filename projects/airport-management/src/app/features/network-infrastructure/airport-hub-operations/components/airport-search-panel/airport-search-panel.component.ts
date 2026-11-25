
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { IAirportSearchCriteria } from '../../store/airports.store';

@Component({
  selector: 'aoms-airport-search-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './airport-search-panel.component.html',
  styleUrl: './airport-search-panel.component.scss',
})
export class AirportSearchPanelComponent implements OnInit {
  // ── Inputs ─────────────────────────────────────────────────────────────
  readonly initialCriteria = input<IAirportSearchCriteria>({
    iataCode: '',
    icaoCode: '',
    city: '',
    countryIsoCode: '',
  });

  readonly loading = input<boolean>(false);

  // ── Outputs ────────────────────────────────────────────────────────────
  readonly onSearch = output<IAirportSearchCriteria>();
  readonly onClear = output<void>();
  readonly onAddNew = output<void>();

  // ── Form ───────────────────────────────────────────────────────────────
  protected readonly form: FormGroup;

  constructor(private readonly fb: FormBuilder) {
    this.form = this.fb.group({
      iataCode: [''],
      icaoCode: [''],
      city: [''],
      countryIsoCode: [''],
    });
  }

  ngOnInit(): void {
    // Pre-populate if criteria are provided (e.g. back-navigation restores state)
    const c = this.initialCriteria();
    if (c) {
      this.form.patchValue(c, { emitEvent: false });
    }

    // Auto-uppercase IATA, ICAO, Country
    this._autoUpper('iataCode', 3);
    this._autoUpper('icaoCode', 4);
    this._autoUpper('countryIsoCode', 2);
  }

  protected submit(): void {
    const v = this.form.value;
    this.onSearch.emit({
      iataCode: (v.iataCode ?? '').toUpperCase().trim(),
      icaoCode: (v.icaoCode ?? '').toUpperCase().trim(),
      city: (v.city ?? '').trim(),
      countryIsoCode: (v.countryIsoCode ?? '').toUpperCase().trim(),
    });
  }

  protected clear(): void {
    this.form.reset({
      iataCode: '',
      icaoCode: '',
      city: '',
      countryIsoCode: '',
    });
    this.onClear.emit();
  }

  protected addNew(): void {
    this.onAddNew.emit();
  }

  /** True if any search field has a value. */
  protected get hasValues(): boolean {
    const v = this.form.value;
    return !!(v.iataCode || v.icaoCode || v.city || v.countryIsoCode);
  }

  private _autoUpper(name: string, maxLen?: number): void {
    this.form.get(name)?.valueChanges.subscribe((val: string) => {
      if (!val) return;
      let next = val.toUpperCase();
      if (maxLen) next = next.slice(0, maxLen);
      if (next !== val) {
        this.form.get(name)?.setValue(next, { emitEvent: false });
      }
    });
  }
}