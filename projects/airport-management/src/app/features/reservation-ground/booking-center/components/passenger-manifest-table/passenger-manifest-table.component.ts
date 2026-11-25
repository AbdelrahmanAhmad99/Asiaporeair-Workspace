

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { IPassengerDto } from '@shared-core';

@Component({
  selector: 'aoms-passenger-manifest-table',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './passenger-manifest-table.component.html',
  styleUrl: './passenger-manifest-table.component.scss',
})
export class PassengerManifestTableComponent {
  readonly passengers = input.required<IPassengerDto[]>();
  readonly loading = input<boolean>(false);

  readonly hasPassengers = computed<boolean>(() => this.passengers().length > 0);

  readonly formattedPassengers = computed(() =>
    this.passengers().map(p => ({
      ...p,
      fullName: `${p.firstName} ${p.lastName}`.trim(),
      dobFormatted: p.dateOfBirth
        ? new Date(p.dateOfBirth).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        : '—',
      initials: `${p.firstName.charAt(0)}${p.lastName.charAt(0)}`.toUpperCase(),
    }))
  );
}