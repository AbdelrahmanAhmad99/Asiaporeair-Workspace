
import {
  ChangeDetectionStrategy,
  Component,
  OnChanges,
  SimpleChanges,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

type BtnPhase = 'idle' | 'restoring' | 'error';

@Component({
  selector: 'aoms-reactivate-action-button',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './reactivate-action-button.component.html',
  styleUrl: './reactivate-action-button.component.scss',
})
export class ReactivateActionButtonComponent implements OnChanges {
  // ── Signal Inputs ─────────────────────────────────────────────────────
  readonly iataCode = input.required<string>();
  readonly restoringCode = input<string | null>(null);
  readonly disabled = input<boolean>(false);
  readonly hasError = input<boolean>(false);

  // ── Output ─────────────────────────────────────────────────────────────
  readonly reactivate = output<string>();

  // ── Internal phase ────────────────────────────────────────────────────
  protected readonly phase = signal<BtnPhase>('idle');
  private _errorTimer: ReturnType<typeof setTimeout> | null = null;

  // ── Derived ────────────────────────────────────────────────────────────
  protected readonly isThisRestoring = computed<boolean>(
    () => this.restoringCode() === this.iataCode()
  );

  protected readonly isAnyRestoring = computed<boolean>(
    () => this.restoringCode() !== null
  );

  // ── Lifecycle ─────────────────────────────────────────────────────────

  ngOnChanges(changes: SimpleChanges): void {
    // Transition into 'restoring' when this row's code matches restoringCode
    if (changes['restoringCode']) {
      if (this.isThisRestoring()) {
        this.phase.set('restoring');
        if (this._errorTimer) { clearTimeout(this._errorTimer); this._errorTimer = null; }
      } else if (this.phase() === 'restoring') {
        // restoringCode changed away from ours — did it fail?
        if (this.hasError()) {
          this._enterErrorPhase();
        } else {
          this.phase.set('idle');
        }
      }
    }

    // React to hasError if restoringCode is already gone
    if (changes['hasError'] && this.hasError() && !this.isAnyRestoring()) {
      this._enterErrorPhase();
    }
  }

  // ── Action ─────────────────────────────────────────────────────────────

  protected onReactivate(): void {
    if (this.disabled() || this.isAnyRestoring() || this.phase() === 'error') return;
    this.reactivate.emit(this.iataCode());
  }

  // ── Private ────────────────────────────────────────────────────────────

  private _enterErrorPhase(): void {
    this.phase.set('error');
    this._errorTimer = setTimeout(() => {
      this.phase.set('idle');
      this._errorTimer = null;
    }, 3000);
  }
}