
import {
  ChangeDetectionStrategy, Component, computed, input, output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  animate, query, stagger, style, transition, trigger,
} from '@angular/animations';
import { IRosterEntry } from '../../store/tactical-trc.store';

const ROSTER_STAGGER = trigger('rosterIn', [
  transition('* => *', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(8px)' }),
      stagger(28, [
        animate('260ms cubic-bezier(0.4,0,0.2,1)',
          style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ], { optional: true }),
  ]),
]);

@Component({
  selector: 'aoms-flight-crew-roster-list',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [ROSTER_STAGGER],
  templateUrl: './flight-crew-roster-list.component.html',
  styleUrl: './flight-crew-roster-list.component.scss',
})
export class FlightCrewRosterListComponent {
  readonly pilots = input.required<IRosterEntry[]>();
  readonly attendants = input.required<IRosterEntry[]>();
  readonly loading = input<boolean>(false);
  readonly processingId = input<number | null>(null);

  readonly removeMember = output<number>();

  protected readonly shimmerRows = Array(3).fill(null);

  protected initials(entry: IRosterEntry): string {
    const parts = entry.fullName.split(' ');
    return `${parts[0]?.[0] ?? ''}${parts.at(-1)?.[0] ?? ''}`.toUpperCase();
  }
}