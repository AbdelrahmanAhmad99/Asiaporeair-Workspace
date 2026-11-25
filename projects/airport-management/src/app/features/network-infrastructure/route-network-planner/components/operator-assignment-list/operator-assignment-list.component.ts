
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  animate,
  query,
  stagger,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { IRouteOperatorDto } from '@shared-core';
import { IAirlineDto } from '@shared-core';

const listAnim = trigger('opList', [
  transition('* => *', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateX(-8px)' }),
      stagger(25, [
        animate('210ms cubic-bezier(0.22, 1, 0.36, 1)',
          style({ opacity: 1, transform: 'translateX(0)' })),
      ]),
    ], { optional: true }),
    query(':leave', [
      animate('180ms ease', style({ opacity: 0, transform: 'translateX(8px)' })),
    ], { optional: true }),
  ]),
]);

interface IGridCol { key: string; label: string; shimmerWidth: string; hideMd?: boolean; }

@Component({
  selector: 'aoms-operator-assignment-list',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [listAnim],
  templateUrl: './operator-assignment-list.component.html',
  styleUrl: './operator-assignment-list.component.scss',
})
export class OperatorAssignmentListComponent {
  readonly operators = input.required<IRouteOperatorDto[]>();
  readonly airlines = input<IAirlineDto[]>([]);
  readonly loading = input<boolean>(false);
  readonly isProcessing = input<boolean>(false);
  readonly revokingIata = input<string | null>(null);

  readonly onEdit = output<IRouteOperatorDto>();
  readonly onRevoke = output<IRouteOperatorDto>();

  protected readonly columns: IGridCol[] = [
    { key: 'logo', label: '', shimmerWidth: '36px' },
    { key: 'airline', label: 'Airline', shimmerWidth: '55%' },
    { key: 'type', label: 'Type', shimmerWidth: '60px' },
    { key: 'region', label: 'Region', shimmerWidth: '45%', hideMd: true },
    { key: 'status', label: 'Status', shimmerWidth: '52px' },
    { key: 'actions', label: 'Actions', shimmerWidth: '80px' },
  ];

  protected readonly shimmerRows = Array(4).fill(null);

  protected airlineName(iata: string): string {
    return this.airlines().find(a => a.iataCode === iata)?.name ?? iata;
  }
  protected airlineRegion(iata: string): string {
    return this.airlines().find(a => a.iataCode === iata)?.operatingRegion ?? '—';
  }
  protected logoInitials(iata: string): string {
    const name = this.airlineName(iata);
    const words = name.trim().split(/\s+/);
    return words.length === 1
      ? words[0].slice(0, 2).toUpperCase()
      : words.slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }
  protected isBeingRevoked(iata: string): boolean {
    return this.revokingIata() === iata;
  }
}