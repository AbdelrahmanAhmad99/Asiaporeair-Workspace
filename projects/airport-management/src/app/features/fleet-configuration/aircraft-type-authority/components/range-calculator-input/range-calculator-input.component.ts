
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RangeMode } from '../../store/aircraft-types.store';

// ── Distance constants ────────────────────────────────────────────────────
const KM_TO_NM = 0.539957;
const NM_TO_KM = 1.852;
const MIN_KM = 100;
const MAX_KM = 20_000;

type UnitMode = 'km' | 'nm';

// ── Route presets ─────────────────────────────────────────────────────────
interface IRoutePreset {
  label: string;
  distanceKm: number;
  archetype: string;
}

const ROUTE_PRESETS: IRoutePreset[] = [
  { label: '2,500 km', distanceKm: 2_500, archetype: 'Short-Haul' },
  { label: '6,000 km', distanceKm: 6_000, archetype: 'Medium-Haul' },
  { label: '10,000 km', distanceKm: 10_000, archetype: 'Long-Haul' },
  { label: '15,000 km', distanceKm: 15_000, archetype: 'Ultra-Long' },
];

@Component({
  selector: 'aoms-range-calculator-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './range-calculator-input.component.html',
  styleUrl: './range-calculator-input.component.scss',
})
export class RangeCalculatorInputComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  // ── Inputs ──────────────────────────────────────────────────────────────
  readonly initialDistance = input<number>(5_000);
  readonly initialMode = input<RangeMode>('direct');
  readonly isAnalyzing = input<boolean>(false);

  // ── Outputs ─────────────────────────────────────────────────────────────
  readonly distanceChanged = output<number>();
  readonly modeChanged = output<RangeMode>();

  // ── Local State ─────────────────────────────────────────────────────────
  protected distanceKm = signal<number>(5_000);
  protected unitMode = signal<UnitMode>('km');
  protected rangeMode = signal<RangeMode>('direct');
  protected readonly presets = ROUTE_PRESETS;

  // ── Derived ───────────────────────────────────────────────────────────
  /** Display value — converts km to nm when unit is nm. */
  protected readonly displayValue = computed(() =>
    this.unitMode() === 'nm'
      ? Math.round(this.distanceKm() * KM_TO_NM)
      : this.distanceKm()
  );

  protected readonly displayUnit = computed(() => this.unitMode());

  protected readonly displayMax = computed(() =>
    this.unitMode() === 'nm' ? Math.round(MAX_KM * KM_TO_NM) : MAX_KM
  );

  protected readonly displayMin = computed(() =>
    this.unitMode() === 'nm' ? Math.round(MIN_KM * KM_TO_NM) : MIN_KM
  );

  /** 0–100 fill percentage for the slider track CSS. */
  protected readonly sliderPercent = computed(() =>
    Math.round(((this.distanceKm() - MIN_KM) / (MAX_KM - MIN_KM)) * 100)
  );

  /** SVG arc control point that shifts as distance grows. */
  protected readonly arcCurve = computed(() => {
    const pct = this.sliderPercent() / 100;
    const cy = 60 - pct * 40; // arc peak rises from 60 → 20
    return `M 10,80 Q 150,${cy} 290,80`;
  });

  protected readonly labelY = computed(() => {
    const pct = this.sliderPercent() / 100;
    const cy = 60 - pct * 40; // arc peak rises from 60 → 20
    return cy - 14;
  });

  private readonly distance$ = new Subject<number>();

  // ── Lifecycle ────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.distanceKm.set(this.initialDistance());
    this.rangeMode.set(this.initialMode());

    // Debounce slider/input emissions by 350ms
    this.distance$
      .pipe(
        debounceTime(350),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(km => this.distanceChanged.emit(km));
  }

  // ── Handlers ─────────────────────────────────────────────────────────────
  protected onSliderChange(raw: number): void {
    const km = this.unitMode() === 'nm' ? Math.round(raw * NM_TO_KM) : raw;
    this.distanceKm.set(this._clamp(km));
    this.distance$.next(this.distanceKm());
  }

  protected onInputChange(raw: number): void {
    if (isNaN(raw)) return;
    const km = this.unitMode() === 'nm' ? Math.round(raw * NM_TO_KM) : raw;
    this.distanceKm.set(this._clamp(km));
    this.distance$.next(this.distanceKm());
  }

  protected onPresetClick(preset: IRoutePreset): void {
    this.distanceKm.set(preset.distanceKm);
    this.distance$.next(preset.distanceKm);
  }

  protected toggleUnit(): void {
    this.unitMode.update(u => u === 'km' ? 'nm' : 'km');
  }

  protected toggleMode(): void {
    const next: RangeMode = this.rangeMode() === 'direct' ? 'etops' : 'direct';
    this.rangeMode.set(next);
    this.modeChanged.emit(next);
  }

  private _clamp(km: number): number {
    return Math.max(MIN_KM, Math.min(MAX_KM, km));
  }
}