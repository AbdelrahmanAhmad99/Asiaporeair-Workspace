// ============================================================================
// fares-directory.component.ts
// Asiaporeair | "Active Fare Directory" — Smart Page
//
// Fetches all active fares via flightsService.getAllActiveFares(),
// stores them in flights.store.ts via setActiveFares(), and renders
// them through the FarePackageCardComponent grid.
//
// Store fields consumed:
//   activeFares     → IFareBasisCodeDto[]  — the data
//   isFaresLoading  → computed boolean      — skeleton control
//   faresError      → string | null        — error display
// ============================================================================

import {
  Component, OnInit, OnDestroy,
  ChangeDetectionStrategy, inject, computed, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  trigger, transition, style, animate, query, stagger
} from '@angular/animations';
import { Subject, takeUntil } from 'rxjs';
import { finalize, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

import { FlightsStore } from '../../../store/flights.store';
import { FlightsService } from '@shared-core';
import { IFareBasisCodeDto } from '@shared-core';

import { FarePackageCardComponent } from '../../components/fare-package-card/fare-package-card.component';

// ── Cabin tier for filtering ───────────────────────────────────────────────────
type FilterTier = 'all' | 'first' | 'business' | 'premium' | 'economy';

function getTier(code: string): FilterTier {
  const p = code.charAt(0).toUpperCase();
  if (p === 'F') return 'first';
  if (p === 'J' || p === 'C') return 'business';
  if (p === 'W') return 'premium';
  return 'economy';
}

// ── Animations ────────────────────────────────────────────────────────────────
const PAGE_ANIMATIONS = [
  trigger('heroReveal', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateY(-14px)' }),
      animate('480ms cubic-bezier(0.22, 1, 0.36, 1)',
        style({ opacity: 1, transform: 'translateY(0)' }))
    ])
  ]),
  trigger('gridReveal', [
    transition(':enter', [
      query('.fare-card-host', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        stagger(70, [
          animate('420ms cubic-bezier(0.22, 1, 0.36, 1)',
            style({ opacity: 1, transform: 'translateY(0)' }))
        ])
      ], { optional: true })
    ])
  ]),
  trigger('fadeIn', [
    transition(':enter', [
      style({ opacity: 0 }),
      animate('280ms ease', style({ opacity: 1 }))
    ])
  ])
];

@Component({
  selector: 'app-fares-directory',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FarePackageCardComponent
  ],
  animations: PAGE_ANIMATIONS,
  templateUrl: './fares-directory.component.html',
  styleUrls: ['./fares-directory.component.scss']
})
export class FaresDirectoryComponent implements OnInit, OnDestroy {

  // ── DI ────────────────────────────────────────────────────────────────────
  private readonly store = inject(FlightsStore);
  private readonly flightsService = inject(FlightsService);
  readonly router = inject(Router);
  private readonly destroy$ = new Subject<void>();

  // ── Store signal aliases ──────────────────────────────────────────────────
  readonly isLoadingFares = this.store.isFaresLoading;
  readonly faresError = this.store.faresError;

  // ── Local UI state ────────────────────────────────────────────────────────
  readonly activeFilter = signal<FilterTier>('all');
  readonly searchQuery = signal<string>('');

  // ── Filtered + searched fares ─────────────────────────────────────────────

  readonly filteredFares = computed((): IFareBasisCodeDto[] => {
    const all = this.store.activeFares();
    const filter = this.activeFilter();
    const query = this.searchQuery().toLowerCase().trim();

    return all.filter(f => {
      const tierMatch = filter === 'all' || getTier(f.code) === filter;
      const queryMatch = !query ||
        f.code.toLowerCase().includes(query) ||
        f.description.toLowerCase().includes(query);
      return tierMatch && queryMatch;
    });
  });

  readonly totalFaresCount = computed(() => this.store.activeFares().length);

  readonly filterCounts = computed(() => ({
    all: this.store.activeFares().length,
    first: this.store.activeFares().filter(f => getTier(f.code) === 'first').length,
    business: this.store.activeFares().filter(f => getTier(f.code) === 'business').length,
    premium: this.store.activeFares().filter(f => getTier(f.code) === 'premium').length,
    economy: this.store.activeFares().filter(f => getTier(f.code) === 'economy').length,
  }));

  // ── Skeleton placeholder array ─────────────────────────────────────────────
  readonly skeletonItems = Array.from({ length: 6 });

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    // Only fetch if not already loaded in this session
    if (this.store.activeFares().length === 0) {
      this.loadFares();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Data loading ─────────────────────────────────────────────────────────

  loadFares(): void {
    this.store.setFaresLoading();

    this.flightsService.getAllActiveFares()
      .pipe(
        takeUntil(this.destroy$),
        catchError((err: HttpErrorResponse) => {
          this.store.setFaresError(this.resolveError(err));
          return of([]);
        }),
        finalize(() => {
          // If loading is still true after error path, clear it
          if (this.store.faresLoadStatus() === 'loading') {
            this.store.setFaresError('Unable to load fares at this time.');
          }
        })
      )
      .subscribe(fares => {
        if (fares.length > 0) {
          this.store.setActiveFares(fares);
        }
      });
  }

  // ── Filter & search ───────────────────────────────────────────────────────

  setFilter(tier: FilterTier): void {
    this.activeFilter.set(tier);
  }

  onSearchInput(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  // ── Card event handlers ───────────────────────────────────────────────────

  onFareSelected(fare: IFareBasisCodeDto): void {
    // Navigate to the flight search with this fare type pre-selected
    // (no booking store involvement — this is exploration only)
    this.router.navigate(['/flight-info/search']);
  }

  // ── Navigation helpers ────────────────────────────────────────────────────

  navigateToDestinations(): void {
    this.router.navigate(['/flight-info/search']);
  }

  navigateToFlightStatus(): void {
    this.router.navigate(['/flight-info/status']);
  }

  // ── Error resolution ──────────────────────────────────────────────────────

  private resolveError(err: HttpErrorResponse): string {
    if (err.status === 0) return 'Connection unavailable. Please check your network.';
    if (err.status === 503) return 'Our fare systems are temporarily unavailable. Please try again shortly.';
    return 'Unable to retrieve active fares. Please refresh the page.';
  }
}