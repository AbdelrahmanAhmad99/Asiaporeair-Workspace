

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { IPassengerDto } from '@shared-core';

@Component({
  selector: 'aoms-pax-manifest-table',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pax-manifest-table.component.html',
  styleUrl: './pax-manifest-table.component.scss',
})
export class PaxManifestTableComponent {
  // ── Inputs ─────────────────────────────────────────────────────────────
  readonly passengers = input.required<IPassengerDto[]>();
  readonly loading = input<boolean>(false);
  readonly hasSearched = input<boolean>(false);
  readonly activePassengerId = input<number | null>(null);

  // ── Outputs ────────────────────────────────────────────────────────────
  readonly viewPassenger = output<IPassengerDto>();
  readonly deletePassenger = output<IPassengerDto>();

  // ── Computed ───────────────────────────────────────────────────────────
  readonly isEmpty = computed<boolean>(
    () => this.hasSearched() && this.passengers().length === 0 && !this.loading()
  );

  readonly enriched = computed(() =>
    this.passengers().map(p => ({
      ...p,
      fullName: `${p.firstName} ${p.lastName}`.trim(),
      initials: `${p.firstName.charAt(0)}${p.lastName.charAt(0)}`.toUpperCase(),
      dobDisplay: p.dateOfBirth
        ? new Date(p.dateOfBirth).toLocaleDateString('en-GB', {
          day: '2-digit', month: 'short', year: 'numeric',
        })
        : '—',
    }))
  );
}