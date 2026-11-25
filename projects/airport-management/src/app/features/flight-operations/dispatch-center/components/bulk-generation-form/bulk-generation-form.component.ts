
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { IAirlineDto } from '@shared-core';
import { IGenerateInstancesRequestDto } from '@shared-core';

@Component({
  selector: 'aoms-bulk-generation-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './bulk-generation-form.component.html',
  styleUrl: './bulk-generation-form.component.scss',
})
export class BulkGenerationFormComponent {
  // ── Inputs ─────────────────────────────────────────────────────────────
  readonly airlines = input<IAirlineDto[]>([]);
  readonly validityWindow = input<{ earliest: string; latest: string } | null>(null);
  readonly isGenerating = input<boolean>(false);
  readonly formError = input<string | null>(null);

  // ── Outputs ────────────────────────────────────────────────────────────
  readonly onGenerate = output<IGenerateInstancesRequestDto>();
  readonly onCancel = output<void>();

  // ── Airline combobox state ────────────────────────────────────────────
  protected readonly airlineSearch = signal<string>('');
  protected readonly airlineOpen = signal<boolean>(false);
  protected readonly confirmedAirline = signal<IAirlineDto | null>(null);

  protected readonly filteredAirlines = computed<IAirlineDto[]>(() => {
    const q = this.airlineSearch().toLowerCase().trim();
    if (!q) return this.airlines().slice(0, 60);
    return this.airlines().filter(a =>
      a.iataCode.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q) ||
      a.callsign.toLowerCase().includes(q) ||
      a.operatingRegion.toLowerCase().includes(q)
    ).slice(0, 60);
  });

  // ── Form ──────────────────────────────────────────────────────────────
  private readonly fb = inject(FormBuilder);
  readonly form: FormGroup = this.fb.group({
    airlineIataCode: ['', Validators.required],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
    overwrite: [false],
  });

  /** Estimated instance count — rough approximation for the supervisor */
  protected readonly estimatedDays = computed<number>(() => {
    const v = this.form?.value as { startDate: string; endDate: string };
    if (!v?.startDate || !v?.endDate) return 0;
    const ms = new Date(v.endDate).getTime() - new Date(v.startDate).getTime();
    return Math.max(0, Math.round(ms / 86_400_000));
  });

  private readonly formStatus = toSignal(this.form.statusChanges, { initialValue: 'INVALID' });

  protected readonly isFormReady = computed<boolean>(() =>
    !!(this.confirmedAirline() && (this.formStatus() === 'VALID' || this.form.valid) && !this.isGenerating())
  );

  constructor() { }

  // ── Airline combobox ──────────────────────────────────────────────────

  protected onAirlineInput(v: string): void {
    this.airlineSearch.set(v);
    this.confirmedAirline.set(null);
    this.form.get('airlineIataCode')?.setValue('');
    this.airlineOpen.set(true);
  }

  protected selectAirline(a: IAirlineDto): void {
    this.confirmedAirline.set(a);
    this.airlineSearch.set(`${a.iataCode} · ${a.name}`);
    this.form.get('airlineIataCode')?.setValue(a.iataCode);
    this.form.get('airlineIataCode')?.markAsDirty();
    this.airlineOpen.set(false);
  }

  protected onAirlineBlur(): void {
    setTimeout(() => {
      this.airlineOpen.set(false);
      if (!this.confirmedAirline()) {
        this.airlineSearch.set('');
        this.form.get('airlineIataCode')?.setValue('');
      }
    }, 180);
  }

  protected clearAirline(): void {
    this.confirmedAirline.set(null);
    this.airlineSearch.set('');
    this.form.get('airlineIataCode')?.setValue('');
    this.airlineOpen.set(false);
  }

  // ── Validation helpers ────────────────────────────────────────────────

  protected isInvalid(name: string): boolean {
    const c: AbstractControl | null = this.form.get(name);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  // ── Submit ────────────────────────────────────────────────────────────

  protected submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || !this.confirmedAirline()) return;

    const v = this.form.value as {
      airlineIataCode: string;
      startDate: string;
      endDate: string;
    };

    this.onGenerate.emit({
      startDate: v.startDate,
      endDate: v.endDate,
      airlineIataCode: v.airlineIataCode,
    });
  }
}