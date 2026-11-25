

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
import { IAircraftSummaryDto, AircraftReadiness } from '../../store/flight-dispatch.store';

@Component({
  selector: 'aoms-aircraft-picker-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './aircraft-picker-modal.component.html',
  styleUrl: './aircraft-picker-modal.component.scss',
})
export class AircraftPickerModalComponent {
  // ── Inputs ─────────────────────────────────────────────────────────────
  readonly aircraft = input.required<IAircraftSummaryDto[]>();
  readonly selectedTailNumber = input<string | null>(null);
  readonly hasConflict = input<boolean>(false);
  readonly loading = input<boolean>(false);

  // ── Outputs ────────────────────────────────────────────────────────────
  readonly onSelect = output<string>();
  readonly onConfirm = output<void>();
  readonly onDismiss = output<void>();

  // ── Local search filter ───────────────────────────────────────────────
  protected readonly searchQuery = signal<string>('');

  protected readonly filteredAircraft = computed<IAircraftSummaryDto[]>(() => {
    const q = this.searchQuery().toUpperCase().trim();
    if (!q) return this.aircraft();
    return this.aircraft().filter(a =>
      a.tailNumber.includes(q) ||
      (a.lastOriginIata?.includes(q) ?? false) ||
      (a.nextFlight?.toUpperCase().includes(q) ?? false)
    );
  });

  protected readonly shimmerRows = Array(5).fill(null);

  protected isSelected(tail: string): boolean {
    return this.selectedTailNumber() === tail;
  }

  protected canSelect(status: AircraftReadiness): boolean {
    return status !== 'MAINTENANCE';
  }

  protected statusLabel(status: AircraftReadiness): string {
    const map: Record<AircraftReadiness, string> = {
      READY: 'Ready',
      IN_TRANSIT: 'In Transit',
      MAINTENANCE: 'Maintenance',
      UNKNOWN: 'Unknown',
    };
    return map[status] ?? status;
  }

  protected statusCls(status: AircraftReadiness): string {
    const map: Record<AircraftReadiness, string> = {
      READY: 'ready',
      IN_TRANSIT: 'transit',
      MAINTENANCE: 'maintenance',
      UNKNOWN: 'unknown',
    };
    return map[status] ?? 'unknown';
  }

  protected selectAircraft(tail: string, status: AircraftReadiness): void {
    if (!this.canSelect(status)) return;
    this.onSelect.emit(tail);
  }
}