
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { IAirlineDto, IRouteOperatorDto } from '@shared-core';

export interface IAssignPayload {
  routeId: number;
  airlineIataCode: string;
  isCodeshare: boolean;
}

export interface IUpdatePayload {
  airlineIataCode: string;
  isCodeshare: boolean;
}

@Component({
  selector: 'aoms-operator-config-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './operator-config-modal.component.html',
  styleUrl: './operator-config-modal.component.scss',
})
export class OperatorConfigModalComponent implements OnInit {
  // ── Signal Inputs ─────────────────────────────────────────────────────
  readonly routeId = input.required<number>();
  readonly availableAirlines = input<IAirlineDto[]>([]);
  readonly editTarget = input<IRouteOperatorDto | null>(null);
  readonly isProcessing = input<boolean>(false);
  readonly availabilityLoading = input<boolean>(false);
  readonly formError = input<string | null>(null);

  // ── Outputs ───────────────────────────────────────────────────────────
  readonly onAssign = output<IAssignPayload>();
  readonly onUpdate = output<IUpdatePayload>();
  readonly onClose = output<void>();

  // ── Mode ──────────────────────────────────────────────────────────────
  readonly isEditMode = computed<boolean>(() => this.editTarget() !== null);
  readonly modalTitle = computed<string>(() =>
    this.isEditMode()
      ? `Modify Operator — ${this.editTarget()!.airlineIataCode}`
      : 'Assign New Corridor Operator'
  );

  // ── Form ──────────────────────────────────────────────────────────────
  readonly form: FormGroup;

  protected readonly dropdownOpen = signal<boolean>(false);
  protected readonly selectedIata = signal<string>('');

  protected readonly selectedAirline = computed(() =>
    this.availableAirlines().find(a => a.iataCode === this.selectedIata())
  );

  constructor(private readonly fb: FormBuilder) {
    this.form = this.fb.group({
      airlineIataCode: ['', Validators.required],
      isCodeshare: [false],
    });

    // Pre-populate when editTarget arrives
    effect(() => {
      const t = this.editTarget();
      if (t) {
        this.selectedIata.set(t.airlineIataCode);
        this.form.patchValue({ airlineIataCode: t.airlineIataCode, isCodeshare: t.isCodeshare }, { emitEvent: false });
        this.form.get('airlineIataCode')?.disable();
      } else {
        this.form.get('airlineIataCode')?.enable();
      }
    });
  }

  ngOnInit(): void { }

  // ── Airline dropdown ──────────────────────────────────────────────────

  protected selectAirline(airline: IAirlineDto): void {
    this.selectedIata.set(airline.iataCode);
    this.form.get('airlineIataCode')?.setValue(airline.iataCode);
    this.form.get('airlineIataCode')?.markAsDirty();
    this.dropdownOpen.set(false);
  }

  protected toggleDropdown(): void {
    if (this.availabilityLoading() || this.isProcessing()) return;
    this.dropdownOpen.update(v => !v);
  }

  protected clearSelection(): void {
    this.selectedIata.set('');
    this.form.get('airlineIataCode')?.setValue('');
    this.dropdownOpen.set(false);
  }

  protected onDropdownBlur(): void {
    setTimeout(() => this.dropdownOpen.set(false), 180);
  }

  protected logoInitials(name: string | undefined): string {
    if (!name) return '??';
    const words = name.trim().split(/\s+/);
    return words.length === 1 ? words[0].slice(0, 2).toUpperCase()
      : words.slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }

  // ── Submit ────────────────────────────────────────────────────────────

  protected submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const { airlineIataCode, isCodeshare } = this.form.getRawValue() as {
      airlineIataCode: string;
      isCodeshare: boolean;
    };

    if (this.isEditMode()) {
      this.onUpdate.emit({ airlineIataCode, isCodeshare });
    } else {
      this.onAssign.emit({ routeId: this.routeId(), airlineIataCode, isCodeshare });
    }
  }

  protected isInvalid(name: string): boolean {
    const c: AbstractControl | null = this.form.get(name);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }
}