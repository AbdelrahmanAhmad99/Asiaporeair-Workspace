

import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  animate, style, transition, trigger,
} from '@angular/animations';

import { TacticalTrcStore } from '../../store/tactical-trc.store';
import { FlightSelectionBarComponent } from '../../components/flight-selection-bar/flight-selection-bar.component';
import { FlightCrewRosterListComponent } from '../../components/flight-crew-roster-list/flight-crew-roster-list.component';
import { RosterActionToolbarComponent } from '../../components/roster-action-toolbar/roster-action-toolbar.component';
import { CrewConflictAlertComponent } from '../../components/crew-conflict-alert/crew-conflict-alert.component';
import { CrewSelectorModalComponent } from '../../components/crew-selector-modal/crew-selector-modal.component';
import { IFlightInstanceDto, IFlightInstanceFilterDto } from '@shared-core';

const FRP_ANIMATIONS = [
  trigger('viewEnter', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateX(16px)' }),
      animate('300ms 40ms cubic-bezier(0.4,0,0.2,1)',
        style({ opacity: 1, transform: 'translateX(0)' })),
    ]),
  ]),
  trigger('pageEnter', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateY(10px)' }),
      animate('350ms 30ms cubic-bezier(0.4,0,0.2,1)',
        style({ opacity: 1, transform: 'translateY(0)' })),
    ]),
  ]),
];

@Component({
  selector: 'aoms-flight-roster-planner',
  standalone: true,
  imports: [
    CommonModule,
    FlightSelectionBarComponent,
    FlightCrewRosterListComponent,
    RosterActionToolbarComponent,
    CrewConflictAlertComponent,
    CrewSelectorModalComponent,
  ],
  animations: FRP_ANIMATIONS,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './flight-roster-planner.component.html',
  styleUrl: './flight-roster-planner.component.scss',
})
export class FlightRosterPlannerComponent implements OnInit, OnDestroy {
  protected readonly store = inject(TacticalTrcStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly isDarkMode = signal<boolean>(
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('aoms-dark')
  );

  ngOnInit(): void {
    this.store.loadFlights();
    // Support direct URL with flight ID
    const flightId = parseInt(this.route.snapshot.paramMap.get('flightId') ?? '', 10);
    if (flightId) {
      this.store.loadRoster(flightId);
    }
  }

  ngOnDestroy(): void {
    this.store.clearActionState();
    this.store.clearRosterErrors();
  }

  // ── Navigation ──────────────────────────────────────────────────────
  protected goToHome(): void {
    this.router.navigate(['aoms/workforce-intelligence']);
  }

  protected onGoToAvailabilityExplorer(): void {
    this.router.navigate(['./availability-explorer'], { relativeTo: this.route.parent });
  }

  protected toggleDarkMode(): void {
    const next = !this.isDarkMode();
    document.documentElement.classList.toggle('aoms-dark', next);
    this.isDarkMode.set(next);
  }

  // ── Search / Selection ──────────────────────────────────────────────
  protected onFlightSelected(flight: IFlightInstanceDto): void {
    this.store.selectFlight(flight);
  }

  protected onFilterChanged(filter: Partial<IFlightInstanceFilterDto>): void {
    this.store.searchFlights(filter);
  }

  protected onResetFilter(): void {
    this.store.resetFlightFilters();
  }

  // ── Roster actions ──────────────────────────────────────────────────
  protected onRemoveMember(employeeId: number): void {
    this.store.requestRemoveMember(employeeId);
  }

  protected async onConfirmRemove(): Promise<void> {
    await this.store.confirmRemoveMember();
  }

  protected onCancelRemove(): void {
    this.store.cancelRemove();
  }

  // ── Crew Selector ────────────────────────────────────────────────────
  protected onAssignPilot(): void {
    this.store.openCrewSelector('pilot');
  }

  protected onAssignCrew(): void {
    this.store.openCrewSelector('attendant');
  }

  protected async onAssignSelected(ids: number[]): Promise<void> {
    await this.store.assignMember(ids);
  }

  protected onCloseSelector(): void {
    this.store.closeCrewSelector();
  }
}  