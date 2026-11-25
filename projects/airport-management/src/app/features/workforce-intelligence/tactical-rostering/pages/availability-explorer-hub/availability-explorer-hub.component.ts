
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  animate, query, stagger, style, transition, trigger,
} from '@angular/animations';

import { TacticalTrcStore } from '../../store/tactical-trc.store';
import {
  AvailabilitySearchFiltersComponent,
  IAvailabilitySearchCriteria
} from '../../components/availability-search-filters/availability-search-filters.component';
import { AvailableCrewCardComponent } from '../../components/available-crew-card/available-crew-card.component';

const TRC_BASE = 'aoms/workforce-intelligence/tactical-rostering';

const AEH_ANIMATIONS = [
  trigger('cardsIn', [
    transition('* => loaded', [
      query('.aeh-card-slot', [
        style({ opacity: 0, transform: 'translateY(16px)' }),
        stagger(50, [
          animate('280ms cubic-bezier(0.4,0,0.2,1)',
            style({ opacity: 1, transform: 'translateY(0)' })),
        ]),
      ], { optional: true }),
    ]),
  ]),
  trigger('pageIn', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateY(10px)' }),
      animate('350ms 30ms cubic-bezier(0.4,0,0.2,1)',
        style({ opacity: 1, transform: 'translateY(0)' })),
    ]),
  ]),
];

@Component({
  selector: 'aoms-availability-explorer-hub',
  standalone: true,
  imports: [
    CommonModule,
    AvailabilitySearchFiltersComponent,
    AvailableCrewCardComponent,
  ],
  animations: AEH_ANIMATIONS,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './availability-explorer-hub.component.html',
  styleUrl: './availability-explorer-hub.component.scss',
})
export class AvailabilityExplorerHubComponent implements OnInit, OnDestroy {
  protected readonly store = inject(TacticalTrcStore);
  private readonly router = inject(Router);

  protected readonly isDarkMode = signal<boolean>(
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('aoms-dark')
  );

  protected readonly shimmerCards = Array(9).fill(null);

  protected readonly loadState = computed(() => this.store.aehLoadState());

  ngOnInit(): void {
    // Pre-load expiring certs for the alert panel
    this.store.loadExpiringCertifications(30);
  }

  ngOnDestroy(): void {
    this.store.clearRosterSelections();
  }

  // ── Navigation ──────────────────────────────────────────────────────
  protected goToRosterPlanner(): void {
    this.router.navigate([TRC_BASE, 'roster-planner']);
  }

  protected toggleDarkMode(): void {
    const next = !this.isDarkMode();
    document.documentElement.classList.toggle('aoms-dark', next);
    this.isDarkMode.set(next);
  }

  // ── Search ──────────────────────────────────────────────────────────
  protected onSearchSubmitted(criteria: IAvailabilitySearchCriteria): void {
    this.store.executeSearch(criteria as Parameters<TacticalTrcStore['executeSearch']>[0]);
  }

  protected onReset(): void {
    this.store.resetSearch();
  }

  protected onRetry(): void {
    this.store.retrySearch();
  }

  // ── Selection ────────────────────────────────────────────────────────
  protected onCardClicked(employeeId: number): void {
    this.store.toggleRosterSelection(employeeId);
  }

  protected onSelectClicked(employeeId: number): void {
    this.store.toggleRosterSelection(employeeId);
  }

  protected isCardSelected(employeeId: number): boolean {
    return this.store.selectedForRoster().has(employeeId);
  }

  protected onClearSelections(): void {
    this.store.clearRosterSelections();
  }

  // Navigate to roster planner to action the selection
  protected onProceedToRoster(): void {
    this.router.navigate([TRC_BASE, 'roster-planner']);
  }
}