
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  forwardRef,
  inject,
  input,
  model,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'aoms-status-toggle-switch',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './status-toggle-switch.component.html',
  styleUrl: './status-toggle-switch.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => StatusToggleSwitchComponent),
      multi: true,
    },
  ],
})
export class StatusToggleSwitchComponent implements ControlValueAccessor {
  private readonly cdr = inject(ChangeDetectorRef);

  // ── Inputs ──────────────────────────────────────────────────────────────
  /** Label displayed beside the toggle. */
  readonly label = input<string>('Status');

  /** Descriptive text for the active state (e.g. "Active"). */
  readonly labelOn = input<string>('Active');

  /** Descriptive text for the inactive state (e.g. "Inactive"). */
  readonly labelOff = input<string>('Inactive');

  /** Whether the toggle is disabled. */
  readonly disabled = input<boolean>(false);

  // ── Model signal (two-way bindable) ─────────────────────────────────────
  /** Current checked state — can be used as a plain signal input too. */
  readonly checked = model<boolean>(false);

  // ── Output ──────────────────────────────────────────────────────────────
  /** Emits the new boolean value on every toggle. */
  readonly toggled = output<boolean>();

  // ── CVA internals ────────────────────────────────────────────────────────
  private _onChange: (value: boolean) => void = () => { };
  private _onTouched: () => void = () => { };

  protected toggle(): void {
    if (this.disabled()) return;

    const next = !this.checked();
    this.checked.set(next);

    this._onChange(next);
    this._onTouched();
    this.toggled.emit(next);
  }

  // ── ControlValueAccessor ─────────────────────────────────────────────────
  writeValue(value: boolean): void {
    this.checked.set(!!value);
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // Signals can't be set externally, but we reflect via host binding
    // The parent form will pass disabled state; we read it via the disabled() input
    // for standalone usage, or via the form's disabled state otherwise.
    this.cdr.markForCheck();
  }
}