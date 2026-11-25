
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'aoms-airport-status-toggle',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './airport-status-toggle.component.html',
  styleUrl: './airport-status-toggle.component.scss',
})
export class AirportStatusToggleComponent {
  // ── Inputs ─────────────────────────────────────────────────────────────
  readonly iataCode = input<string>('');
  readonly airportName = input<string>('');
  readonly isProcessing = input<boolean>(false);
  readonly isEditMode = input<boolean>(false);

  // ── Output ────────────────────────────────────────────────────────────
  readonly deactivateConfirmed = output<void>();

  // ── Internal safety guard state ───────────────────────────────────────
  /** True when the user has clicked the initial deactivate button. */
  protected readonly guardOpen = signal<boolean>(false);

  // ── Safety guard actions ──────────────────────────────────────────────

  protected openGuard(): void {
    this.guardOpen.set(true);
  }

  protected closeGuard(): void {
    this.guardOpen.set(false);
  }

  protected confirm(): void {
    this.guardOpen.set(false);
    this.deactivateConfirmed.emit();
  }
}