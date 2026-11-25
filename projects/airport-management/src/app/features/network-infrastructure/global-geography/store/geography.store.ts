

import { Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, switchMap, tap, catchError, EMPTY, of } from 'rxjs';
import { CountriesService } from '@shared-core';
import {
    ICountryDto,
    ICountryWithAirportsDto,
    ICreateCountryDto,
    IUpdateCountryDto,
} from '@shared-core';

// ── Filter Shape ─────────────────────────────────────────────────────────────
export interface IGeographyFilters {
    searchQuery: string;
    continent: string;
}

// ── Stats Shape ──────────────────────────────────────────────────────────────
export interface IGeographyStats {
    total: number;
    perContinent: Record<string, number>;
}

// ── Save Result Shape ─────────────────────────────────────────────────────────
export type SaveResult =
    | { success: true; country: ICountryDto }
    | { success: false; error: string };

// ── Default State ─────────────────────────────────────────────────────────────
const DEFAULT_FILTERS: IGeographyFilters = {
    searchQuery: '',
    continent: '',
};

@Injectable({ providedIn: 'root' })
export class GeographyStore {
    private readonly countriesService = inject(CountriesService);

    // ── Private Writable Signals ─────────────────────────────────────────────
    private readonly _countries = signal<ICountryDto[]>([]);
    private readonly _filters = signal<IGeographyFilters>(DEFAULT_FILTERS);
    private readonly _loading = signal<boolean>(false);
    private readonly _error = signal<string | null>(null);

    // Detail view
    private readonly _selectedCountryWithAirports = signal<ICountryWithAirportsDto | null>(null);
    private readonly _isDetailsLoading = signal<boolean>(false);
    private readonly _detailsError = signal<string | null>(null);

    // Save / mutate state
    private readonly _isSaving = signal<boolean>(false);
    private readonly _saveError = signal<string | null>(null);

    // ── RxJS subjects ────────────────────────────────────────────────────────
    private readonly _loadTrigger$ = new Subject<void>();
    private readonly _detailTrigger$ = new Subject<string>();

    constructor() {
        // ── List pipeline ──────────────────────────────────────────────────────
        this._loadTrigger$
            .pipe(
                tap(() => {
                    this._loading.set(true);
                    this._error.set(null);
                }),
                switchMap(() =>
                    this.countriesService.getAllActiveCountries().pipe(
                        catchError(err => {
                            this._error.set(err?.message ?? 'Failed to load countries.');
                            return of([]);
                        })
                    )
                ),
                tap(() => this._loading.set(false)),
                takeUntilDestroyed()
            )
            .subscribe(countries => this._countries.set(countries));

        // ── Detail pipeline ────────────────────────────────────────────────────
        this._detailTrigger$
            .pipe(
                tap(() => {
                    this._isDetailsLoading.set(true);
                    this._detailsError.set(null);
                    this._selectedCountryWithAirports.set(null);
                }),
                switchMap(isoCode =>
                    this.countriesService.getCountryWithAirports(isoCode).pipe(
                        catchError(err => {
                            const status = err?.status;
                            const msg =
                                status === 404
                                    ? `Country "${isoCode}" was not found.`
                                    : (err?.message ?? 'Failed to load country details.');
                            this._detailsError.set(msg);
                            return of(null);
                        })
                    )
                ),
                tap(() => this._isDetailsLoading.set(false)),
                takeUntilDestroyed()
            )
            .subscribe(country => {
                if (country) {
                    this._selectedCountryWithAirports.set(country);
                }
            });
    }

    // ── Public READ-ONLY Signals ──────────────────────────────────────────────

    /** All countries after applying current filters. */
    readonly filteredCountries = computed<ICountryDto[]>(() => {
        const all = this._countries();
        const filters = this._filters();
        const query = filters.searchQuery.toLowerCase().trim();
        const cont = filters.continent.trim();

        return all.filter(c => {
            const matchesSearch =
                !query ||
                c.name.toLowerCase().includes(query) ||
                c.isoCode.toLowerCase().includes(query);
            const matchesContinent = !cont || c.continent === cont;
            return matchesSearch && matchesContinent;
        });
    });

    /** Aggregate stats derived purely from filtered list. */
    readonly stats = computed<IGeographyStats>(() => {
        const countries = this.filteredCountries();
        const perContinent = countries.reduce<Record<string, number>>((acc, c) => {
            acc[c.continent] = (acc[c.continent] ?? 0) + 1;
            return acc;
        }, {});
        return { total: countries.length, perContinent };
    });

    /** Unique continent list derived from the full (unfiltered) dataset. */
    readonly continents = computed<string[]>(() =>
        [...new Set(this._countries().map(c => c.continent))].sort()
    );

    /** Set of all existing ISO codes (uppercase) for duplicate-check in Create mode. */
    readonly existingIsoCodes = computed<Set<string>>(
        () => new Set(this._countries().map(c => c.isoCode.toUpperCase()))
    );

    // Expose primitive signals as readonly
    readonly loading = this._loading.asReadonly();
    readonly error = this._error.asReadonly();
    readonly filters = this._filters.asReadonly();

    // Detail
    readonly selectedCountryWithAirports = this._selectedCountryWithAirports.asReadonly();
    readonly isDetailsLoading = this._isDetailsLoading.asReadonly();
    readonly detailsError = this._detailsError.asReadonly();

    // Save / mutate
    /** True while a create or update API call is in-flight. */
    readonly isSaving = this._isSaving.asReadonly();

    /** Holds the last save error message (null if last save succeeded or none attempted). */
    readonly saveError = this._saveError.asReadonly();

    // ── Actions ───────────────────────────────────────────────────────────────

    /** Trigger a full reload of the country list from the API. */
    loadAll(): void {
        this._loadTrigger$.next();
    }

    /** Load detailed data (with airports) for a specific country. */
    loadCountryDetails(isoCode: string): void {
        this._detailTrigger$.next(isoCode);
    }

    /** Clear the details view state when navigating away from the details page. */
    clearCountryDetails(): void {
        this._selectedCountryWithAirports.set(null);
        this._detailsError.set(null);
        this._isDetailsLoading.set(false);
    }

    /** Clear any persisted save error (e.g., when the editor form is re-opened). */
    clearSaveError(): void {
        this._saveError.set(null);
    }

    /** Merge partial filter changes; resets computed on next read. */
    applyFilters(partial: Partial<IGeographyFilters>): void {
        this._filters.update(current => ({ ...current, ...partial }));
    }

    /** Reset all filters to defaults. */
    resetFilters(): void {
        this._filters.set(DEFAULT_FILTERS);
    }

    /**
     * Create a new country via the API.
     * On success, appends the new country to the local list immediately.
     * Returns a Promise<SaveResult> so the Smart Component can navigate away or show errors.
     */
    createCountry(dto: ICreateCountryDto): Promise<SaveResult> {
        this._isSaving.set(true);
        this._saveError.set(null);

        return new Promise(resolve => {
            this.countriesService.createCountry(dto).pipe(
                catchError(err => {
                    const msg = this._extractApiError(err, 'Failed to create country.');
                    this._saveError.set(msg);
                    this._isSaving.set(false);
                    resolve({ success: false, error: msg });
                    return EMPTY;
                })
            ).subscribe(country => {
                this._countries.update(list => [...list, country]);
                this._isSaving.set(false);
                resolve({ success: true, country });
            });
        });
    }

    /**
     * Update an existing country via the API.
     * On success, splices the updated record into the local list.
     * Returns a Promise<SaveResult> so the Smart Component can navigate away or show errors.
     */
    updateCountry(isoCode: string, dto: IUpdateCountryDto): Promise<SaveResult> {
        this._isSaving.set(true);
        this._saveError.set(null);

        return new Promise(resolve => {
            this.countriesService.updateCountry(isoCode, dto).pipe(
                catchError(err => {
                    const msg = this._extractApiError(err, 'Failed to update country.');
                    this._saveError.set(msg);
                    this._isSaving.set(false);
                    resolve({ success: false, error: msg });
                    return EMPTY;
                })
            ).subscribe(country => {
                this._countries.update(list =>
                    list.map(c => (c.isoCode === isoCode ? country : c))
                );
                this._isSaving.set(false);
                resolve({ success: true, country });
            });
        });
    }

    /**
     * Soft-delete / deactivate a country by ISO code.
     * Optimistically removes from local state, then calls the API (rollback on failure).
     */
    deleteCountry(isoCode: string): void {
        const prev = this._countries();
        this._countries.update(list => list.filter(c => c.isoCode !== isoCode));

        this.countriesService.deleteCountry(isoCode).pipe(
            catchError(err => {
                this._countries.set(prev);
                this._error.set(err?.message ?? 'Failed to delete country.');
                return EMPTY;
            })
        ).subscribe();
    }

    /**
     * Reactivate a previously deactivated country.
     * Triggers a full reload after the API confirms success.
     */
    reactivateCountry(isoCode: string): void {
        this.countriesService.reactivateCountry(isoCode).pipe(
            tap(() => this.loadAll()),
            catchError(err => {
                this._error.set(err?.message ?? 'Failed to reactivate country.');
                return EMPTY;
            })
        ).subscribe();
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    /**
     * Extracts a human-readable error message from an HttpErrorResponse.
     * Supports Laravel/NestJS-style `errors` objects and plain `message` strings.
     */
    private _extractApiError(err: any, fallback: string): string {
        if (err?.error?.errors && typeof err.error.errors === 'object') {
            return Object.entries<string | string[]>(err.error.errors)
                .map(([field, msgs]) =>
                    `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`
                )
                .join(' · ');
        }
        return err?.error?.message ?? err?.message ?? fallback;
    }
}