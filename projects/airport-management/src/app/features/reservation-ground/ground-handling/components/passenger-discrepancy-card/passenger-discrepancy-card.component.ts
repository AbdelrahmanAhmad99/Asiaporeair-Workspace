

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { INoShowPassenger } from '../../store/ground-handling.store';

@Component({
  selector: 'aoms-passenger-discrepancy-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './passenger-discrepancy-card.component.html',
  styleUrl: './passenger-discrepancy-card.component.scss',
})
export class PassengerDiscrepancyCardComponent {
  // ── Inputs ─────────────────────────────────────────────────────────────
  readonly noShows = input.required<INoShowPassenger[]>();
  readonly loading = input<boolean>(false);

  // ── Outputs ────────────────────────────────────────────────────────────
  readonly locatePassenger = output<INoShowPassenger>();

  // ── Computed ───────────────────────────────────────────────────────────
  readonly count = computed<number>(() => this.noShows().length);
  readonly hasAny = computed<boolean>(() => this.count() > 0);

  // ── Helpers ────────────────────────────────────────────────────────────
  protected fullName(p: INoShowPassenger): string {
    return `${p.firstName} ${p.lastName}`.trim();
  }

  protected hasDocument(p: INoShowPassenger): boolean {
    return !!p.passportNumber;
  }

  protected onLocate(p: INoShowPassenger): void {
    this.locatePassenger.emit(p);
  }

  protected trackById(_: number, p: INoShowPassenger): number {
    return p.passengerId;
  }
}