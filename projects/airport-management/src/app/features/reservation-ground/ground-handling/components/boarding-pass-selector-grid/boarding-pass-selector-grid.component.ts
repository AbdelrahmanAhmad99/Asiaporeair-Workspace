
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IBoardingPassDto } from '@shared-core';
import { IGateSearchFilter } from '../../store/ground-handling.store';

@Component({
  selector: 'aoms-boarding-pass-selector-grid',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './boarding-pass-selector-grid.component.html',
  styleUrl: './boarding-pass-selector-grid.component.scss',
})
export class BoardingPassSelectorGridComponent {
  // ── Inputs ─────────────────────────────────────────────────────────────
  readonly passes = input.required<IBoardingPassDto[]>();
  readonly selectedPassId = input<number | null>(null);
  readonly boardedPassIds = input<IBoardingPassDto[]>([]);
  readonly isScanning = input<boolean>(false);
  readonly currentFilter = input.required<IGateSearchFilter>();

  // ── Outputs ────────────────────────────────────────────────────────────
  readonly passengerSelected = output<number>();       // emits passId
  readonly filterChanged = output<IGateSearchFilter>();
  readonly filterReset = output<void>();

  // ── Local draft (mirrors filter inputs, isolated until emit) ──────────
  protected readonly nameDraft = signal<string>('');
  protected readonly seatDraft = signal<string>('');
  protected readonly showBoardedOnly = signal<boolean | null>(null);

  // ── Computed ───────────────────────────────────────────────────────────
  readonly totalCount = computed<number>(() => this.passes().length);
  readonly boardedSet = computed<Set<number>>(() =>
    new Set(this.boardedPassIds().map(p => p.passId))
  );

  readonly isBoarded = (passId: number): boolean =>
    this.boardedSet().has(passId);

  readonly isSelected = (passId: number): boolean =>
    this.selectedPassId() === passId;

  readonly hasActiveFilter = computed<boolean>(() => {
    const f = this.currentFilter();
    return !!(f.passengerNameContains || f.seatNumber || f.hasBoarded !== null);
  });

  readonly formattedBoarding = (t: string): string => {
    if (!t) return '—';
    return new Date(t).toLocaleTimeString('en-GB', {
      hour: '2-digit', minute: '2-digit',
    });
  };

  readonly formattedDeparture = (t: string): string => {
    if (!t) return '—';
    return new Date(t).toLocaleTimeString('en-GB', {
      hour: '2-digit', minute: '2-digit',
    });
  };

  // ── Event handlers ─────────────────────────────────────────────────────

  protected onRowClick(pass: IBoardingPassDto): void {
    if (this.isScanning()) return; // block during active scan
    this.passengerSelected.emit(pass.passId);
  }

  protected onRowKeydown(event: KeyboardEvent, pass: IBoardingPassDto): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onRowClick(pass);
    }
  }

  protected onNameInput(value: string): void {
    this.nameDraft.set(value);
    this.filterChanged.emit({
      ...this.currentFilter(),
      passengerNameContains: value,
    });
  }

  protected onSeatInput(value: string): void {
    this.seatDraft.set(value);
    this.filterChanged.emit({
      ...this.currentFilter(),
      seatNumber: value,
    });
  }

  protected onBoardedToggle(value: boolean | null): void {
    this.showBoardedOnly.set(value);
    this.filterChanged.emit({
      ...this.currentFilter(),
      hasBoarded: value,
    });
  }

  protected onReset(): void {
    this.nameDraft.set('');
    this.seatDraft.set('');
    this.showBoardedOnly.set(null);
    this.filterReset.emit();
  }

  protected trackByPassId(_: number, p: IBoardingPassDto): number {
    return p.passId;
  }
}