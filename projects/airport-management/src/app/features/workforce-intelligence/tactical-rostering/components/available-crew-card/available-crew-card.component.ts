
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

// Type defined locally to avoid circular import with the store addendum
export interface ICrewAvailabilityResult {
  employeeId: number;
  fullName: string;
  position: string;
  baseAirportIata: string;
  email: string;
  isActive: boolean;
  appUserId: string;
  rank: string;
  availabilityStatus: 'ready' | 'limited' | 'unavailable';
  remainingDutyHours: number;
  maxDutyHours: number;
  dutyHoursPercent: number;
}

@Component({
  selector: 'aoms-available-crew-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './available-crew-card.component.html',
  styleUrl: './available-crew-card.component.scss',
})
export class AvailableCrewCardComponent {
  readonly crew = input.required<ICrewAvailabilityResult>();
  readonly isSelected = input<boolean>(false);
  readonly isProcessing = input<boolean>(false);

  readonly selectClicked = output<number>();  // employeeId
  readonly cardClicked = output<number>();

  protected readonly initials = computed(() => {
    const parts = this.crew().fullName.split(' ');
    return `${parts[0]?.[0] ?? ''}${parts.at(-1)?.[0] ?? ''}`.toUpperCase();
  });

  protected readonly statusLabel = computed(() => {
    const s = this.crew().availabilityStatus;
    return s === 'ready' ? 'Fully Ready' : s === 'limited' ? 'Limited Availability' : 'Unavailable';
  });

  protected readonly dutyBarColor = computed(() => {
    const pct = this.crew().dutyHoursPercent;
    if (pct < 60) return 'bar--safe';
    if (pct < 85) return 'bar--warn';
    return 'bar--critical';
  });

  protected readonly rankDisplayLabel = computed(() => {
    const r = this.crew().rank;
    const map: Record<string, string> = {
      'captain': 'CPT',
      'first-officer': 'F/O',
      'lead-purser': 'LP',
      'purser': 'PUR',
      'senior-attendant': 'S/A',
      'attendant': 'ATT',
    };
    return map[r] ?? r.toUpperCase().slice(0, 3);
  });
}