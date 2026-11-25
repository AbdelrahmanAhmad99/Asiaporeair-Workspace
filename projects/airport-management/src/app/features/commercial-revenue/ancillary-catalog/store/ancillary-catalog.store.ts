
import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { EMPTY, Subscription } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { AncillaryService } from '@shared-core';
import {
    IAncillaryProduct,
    IAncillaryProductFilter,
    ICreateAncillaryProductRequest,
    IUpdateAncillaryProductRequest,
} from '@shared-core';

// ── Category catalogue (also used by filter component) ────────────────────
export const ANCILLARY_CATEGORIES: { label: string; value: string }[] = [
    { label: 'All', value: '' },
    { label: 'Baggage', value: 'Baggage' },
    { label: 'Meal', value: 'Meal' },
    { label: 'Comfort', value: 'Comfort' },
    { label: 'Lounge', value: 'Lounge' },
    { label: 'Wi-Fi', value: 'WiFi' },
    { label: 'Insurance', value: 'Insurance' },
    { label: 'Other', value: 'Other' },
];

// ── Pagination state contract ──────────────────────────────────────────────
export interface IAncillaryPagination {
    currentPage: number;
    pageSize: number;
    total: number;
    totalPages: number;
}

const DEFAULT_PAGINATION: IAncillaryPagination = {
    currentPage: 1,
    pageSize: 12,
    total: 0,
    totalPages: 0,
};

// ── Base route ─────────────────────────────────────────────────────────────
const ANCILLARY_BASE = '/aoms/commercial-revenue/ancillary-catalog';

@Injectable({ providedIn: 'root' })
export class AncillaryCatalogStore {
    private readonly ancillarySvc = inject(AncillaryService);
    private readonly router = inject(Router);

    // ── Private writable signals ───────────────────────────────────────────
    private readonly _products = signal<IAncillaryProduct[]>([]);
    private readonly _pagination = signal<IAncillaryPagination>(DEFAULT_PAGINATION);
    private readonly _selectedCategory = signal<string>('');
    private readonly _searchQuery = signal<string>('');
    private readonly _isLoading = signal<boolean>(false);
    private readonly _error = signal<string | null>(null);
    private readonly _actionProcessing = signal<boolean>(false);
    private readonly _actionSuccess = signal<string | null>(null);
    private readonly _focusedProductId = signal<number | null>(null);
    private readonly _selectedProduct = signal<IAncillaryProduct | null>(null);
    private readonly _isLoadingProduct = signal<boolean>(false);


    // ══════════════════════════════════════════════════════════════════════
    // Phase 2 — Product Definition Center Additions
    // ══════════════════════════════════════════════════════════════════════

    // ── Private writable signals ─────────────────────────────────────────
    private readonly _activeEditingProduct = signal<IAncillaryProduct | null>(null);
    private readonly _editingProductId = signal<number | null>(null);
    private readonly _isSaving = signal<boolean>(false);
    private readonly _isLoadingEdit = signal<boolean>(false);
    private readonly _validationErrors = signal<Record<string, string>>({});
    private readonly _editorError = signal<string | null>(null);
    private readonly _editorSuccess = signal<string | null>(null);

    // ══════════════════════════════════════════════════════════════════════
    // Ancillary Pricing Review — Phase 3 Additions
    // ══════════════════════════════════════════════════════════════════════

    // ── Private writable signals ─────────────────────────────────────────
    private readonly _reviewedProduct = signal<IAncillaryProduct | null>(null);
    private readonly _isReviewLoading = signal<boolean>(false);
    private readonly _reviewError = signal<string | null>(null);


    // ── Public read-only signals ───────────────────────────────────────────
    readonly products = this._products.asReadonly();
    readonly pagination = this._pagination.asReadonly();
    readonly selectedCategory = this._selectedCategory.asReadonly();
    readonly searchQuery = this._searchQuery.asReadonly();
    readonly isLoading = this._isLoading.asReadonly();
    readonly error = this._error.asReadonly();
    readonly actionProcessing = this._actionProcessing.asReadonly();
    readonly actionSuccess = this._actionSuccess.asReadonly();
    readonly focusedProductId = this._focusedProductId.asReadonly();
    readonly selectedProduct = this._selectedProduct.asReadonly();
    readonly isLoadingProduct = this._isLoadingProduct.asReadonly();
    readonly totalProducts = computed(() => this._pagination().total);


    // ── Public read-only signals ─────────────────────────────────────────
    readonly activeEditingProduct = this._activeEditingProduct.asReadonly();
    readonly isSaving = this._isSaving.asReadonly();
    readonly isLoadingEdit = this._isLoadingEdit.asReadonly();
    readonly validationErrors = this._validationErrors.asReadonly();
    readonly editorError = this._editorError.asReadonly();
    readonly editorSuccess = this._editorSuccess.asReadonly();

    readonly reviewedProduct = this._reviewedProduct.asReadonly();
    readonly isReviewLoading = this._isReviewLoading.asReadonly();
    readonly reviewError = this._reviewError.asReadonly();


    // ── Computed signals ───────────────────────────────────────────────────
    readonly hasProducts = computed(() => this._products().length > 0);
    readonly hasActiveFilter = computed(
        () => this._selectedCategory().length > 0 || this._searchQuery().trim().length > 0
    );
    readonly recordCountLabel = computed(() => {
        const { total, currentPage, pageSize } = this._pagination();
        if (total === 0) return 'No products found';
        const start = (currentPage - 1) * pageSize + 1;
        const end = Math.min(currentPage * pageSize, total);
        return `Showing ${start}–${end} of ${total} products`;
    });
    readonly isEditMode = computed(() => this._selectedProduct() !== null);
    readonly categories = computed(() => ANCILLARY_CATEGORIES);

    // ── Category breakdown for the KPI summary bar ────────────────────────
    readonly categoryBreakdown = computed(() => {
        const map = new Map<string, number>();
        this._products().forEach(p => {
            map.set(p.category, (map.get(p.category) ?? 0) + 1);
        });
        return map;
    });

    // ── Subscription registry ──────────────────────────────────────────────
    private _activeSub: Subscription | null = null;

    // ══════════════════════════════════════════════════════════════════════
    // Catalog Actions
    // ══════════════════════════════════════════════════════════════════════

    /**
     * Load a page of ancillary products using the admin paginated endpoint.
     * Preserves category filter and search query state across calls.
     */
    loadProducts(page: number = 1, category?: string, search?: string): void {
        // Update filter state if provided
        if (category !== undefined) this._selectedCategory.set(category);
        if (search !== undefined) this._searchQuery.set(search);

        const currentCategory = this._selectedCategory();
        const currentSearch = this._searchQuery();
        const pageSize = this._pagination().pageSize;

        this._cancelActiveSub();
        this._isLoading.set(true);
        this._error.set(null);

        const filter: IAncillaryProductFilter = {
            nameContains: currentSearch || undefined,
            category: currentCategory || undefined,
            includeDeleted: false,
        };

        this._activeSub = this.ancillarySvc
            .getProductsPaginated(filter, page, pageSize)
            .pipe(
                catchError(err => {
                    this._handleError(err, 'loadProducts');
                    return EMPTY;
                }),
                finalize(() => this._isLoading.set(false))
            )
            .subscribe(result => {
                this._products.set(result.items ?? []);
                this._pagination.set({
                    currentPage: result.pagination?.currentPage ?? page,
                    pageSize: result.pagination?.pageSize ?? pageSize,
                    total: result.pagination?.totalCount ?? 0,
                    totalPages: result.pagination?.totalPages ?? 0,
                });
            });
    }

    /** Change active category filter and reload from page 1. */
    setCategory(category: string): void {
        this._selectedCategory.set(category);
        this.loadProducts(1, category, this._searchQuery());
    }

    /** Update search query and reload from page 1. */
    setSearch(query: string): void {
        this._searchQuery.set(query);
        this.loadProducts(1, this._selectedCategory(), query);
    }

    /** Reset all filters and reload. */
    resetFilters(): void {
        this._selectedCategory.set('');
        this._searchQuery.set('');
        this.loadProducts(1, '', '');
    }

    /** Paginate forward. */
    nextPage(): void {
        const { currentPage, totalPages } = this._pagination();
        if (currentPage >= totalPages) return;
        this.loadProducts(currentPage + 1);
    }

    /** Paginate backward. */
    prevPage(): void {
        const { currentPage } = this._pagination();
        if (currentPage <= 1) return;
        this.loadProducts(currentPage - 1);
    }

    /** Jump to a specific page. */
    goToPage(page: number): void {
        this.loadProducts(page);
    }

    /**
     * Load a single product by ID for the editor.
     * State persists in the store singleton across navigation.
     */
    loadProductById(id: number): void {
        this._isLoadingProduct.set(true);
        this._selectedProduct.set(null);
        this._error.set(null);

        this.ancillarySvc
            .getProductById(id)
            .pipe(
                catchError(err => {
                    this._handleError(err, 'loadProductById');
                    return EMPTY;
                }),
                finalize(() => this._isLoadingProduct.set(false))
            )
            .subscribe(product => {
                this._selectedProduct.set(product);
            });
    }

    /** Clear selected product — call when leaving the editor. */
    clearSelectedProduct(): void {
        this._selectedProduct.set(null);
    }

    /**
     * Optimistic deletion — removes the product card immediately,
     * calls the API, and rolls back with an error message if it fails.
     */
    async deleteProductOptimistic(productId: number): Promise<boolean> {
        const snapshot = this._products();
        this._focusedProductId.set(productId);
        this._actionProcessing.set(true);
        this._error.set(null);

        // Optimistic removal
        this._products.update(list => list.filter(p => p.productId !== productId));
        this._pagination.update(p => ({ ...p, total: Math.max(0, p.total - 1) }));

        return new Promise<boolean>(resolve => {
            this.ancillarySvc
                .deleteProduct(productId)
                .pipe(
                    catchError(err => {
                        // Rollback
                        this._products.set(snapshot);
                        this._pagination.update(p => ({ ...p, total: p.total + 1 }));
                        this._handleError(err, 'deleteProduct');
                        resolve(false);
                        return EMPTY;
                    }),
                    finalize(() => {
                        this._actionProcessing.set(false);
                        this._focusedProductId.set(null);
                    })
                )
                .subscribe(() => {
                    this._actionSuccess.set(`Product has been removed from the catalog.`);
                    this._clearSuccessAfterDelay();
                    resolve(true);
                });
        });
    }

    /** Set a display-friendly error message. */
    setError(msg: string): void {
        this._error.set(msg);
    }

    clearError(): void {
        this._error.set(null);
    }

    clearActionState(): void {
        this._error.set(null);
        this._actionSuccess.set(null);
        this._actionProcessing.set(false);
        this._focusedProductId.set(null);
    }



    readonly marketComparisonData = computed<IMarketComparisonData | null>(() => {
        const product = this._reviewedProduct();
        if (!product) return null;

        const categoryAverage = CATEGORY_AVERAGE_PRICING[product.category] ?? DEFAULT_CATEGORY_AVERAGE;
        const currentPrice = product.baseCost;
        const percentDiff = categoryAverage > 0
            ? ((currentPrice - categoryAverage) / categoryAverage) * 100
            : 0;

        // Deterministic mock pool size + rank, seeded by productId
        const seed = product.productId || 1;
        const totalInCategory = 18 + (seed % 12); // mock pool of 18–29 SKUs
        const popularityRank = 1 + (seed % totalInCategory);

        // Deterministic mock profitability index (0–100 luxury meter)
        const profitabilityIndex = Math.max(
            5,
            Math.min(98, 58 + Math.round(percentDiff) + ((seed * 7) % 15) - 7)
        );

        return {
            categoryAverage,
            currentPrice,
            percentDiff,
            popularityRank,
            totalInCategory,
            profitabilityIndex,
        };
    });

    // ── Computed: Pricing Health Status ───────────────────────────────────

    readonly pricingHealthStatus = computed<PricingHealthStatus>(() => {
        const market = this.marketComparisonData();
        if (!market) return 'Unknown';

        if (market.percentDiff > 12) return 'Over-priced';
        if (market.percentDiff < -12) return 'Under-priced';
        return 'Optimized';
    });

    // ── Computed: Pricing Timeline (mocked history) ───────────────────────

    readonly pricingTimeline = computed<IPricingTimelinePoint[]>(() => {
        const product = this._reviewedProduct();
        if (!product) return [];

        const periods = ['6mo ago', '5mo ago', '4mo ago', '3mo ago', '2mo ago', '1mo ago', 'Current'];
        const seed = product.productId || 1;
        const base = product.baseCost;

        return periods.map((label, i) => {
            if (i === periods.length - 1) {
                return { label, price: base };
            }
            const stepsBack = periods.length - 1 - i;
            const driftFactor = stepsBack * 0.015;
            const noise = Math.sin(seed * (i + 1)) * 0.04;
            const price = Math.max(0, base * (1 - driftFactor + noise));
            return { label, price: Math.round(price * 100) / 100 };
        });
    });

    // ── Actions ──────────────────────────────────────────────────────────

    /**
     * Load full detail for a single product into `reviewedProduct` for the
     * Pricing Intelligence Hub. Maps a 404 to a humanized "Product Not Found"
     * message in the isolated `reviewError` signal.
     */
    loadProductDetails(id: number): void {
        this._isReviewLoading.set(true);
        this._reviewError.set(null);
        this._reviewedProduct.set(null);

        this.ancillarySvc
            .getProductById(id)
            .pipe(
                catchError(err => {
                    this._handleReviewError(err, 'loadProductDetails');
                    return EMPTY;
                }),
                finalize(() => this._isReviewLoading.set(false))
            )
            .subscribe(product => {
                this._reviewedProduct.set(product);
            });
    }

    /** Clear the Pricing Review surface state — call on component destroy. */
    clearReviewState(): void {
        this._reviewedProduct.set(null);
        this._reviewError.set(null);
        this._isReviewLoading.set(false);
    }

    clearReviewError(): void {
        this._reviewError.set(null);
    }


    /**
       * True when editing an existing product (ID present in editing context).
       * Drives the smart component's save dispatch logic.
       */
    readonly isEditorEditMode = computed<boolean>(() => this._editingProductId() !== null);

    // ── Actions ──────────────────────────────────────────────────────────

    /**
     * Hydrate the definition form with an existing product.
     * Called by the smart component when a :id route param is present.
     */
    fetchProductForEdit(id: number): void {
        this._editingProductId.set(id);
        this._activeEditingProduct.set(null);
        this._isLoadingEdit.set(true);
        this._editorError.set(null);

        this.ancillarySvc
            .getProductById(id)
            .pipe(
                catchError(err => {
                    this._handleEditorError(err, 'fetchProductForEdit');
                    return EMPTY;
                }),
                finalize(() => this._isLoadingEdit.set(false))
            )
            .subscribe(product => {
                this._activeEditingProduct.set(product);
            });
    }

    /**
     * Intelligently dispatches to createProduct or updateProduct based on
     * whether _editingProductId is set. Returns Promise<boolean> so the
     * smart component can navigate away or promote the URL on success.
     */
    async saveAncillaryProduct(
        payload: ICreateAncillaryProductRequest | IUpdateAncillaryProductRequest
    ): Promise<boolean> {
        this._isSaving.set(true);
        this._editorError.set(null);
        this._validationErrors.set({});

        const id = this._editingProductId();
        const isNew = id === null;

        return new Promise<boolean>(resolve => {
            const call$ = isNew
                ? this.ancillarySvc.createProduct(payload as ICreateAncillaryProductRequest)
                : this.ancillarySvc.updateProduct(id!, payload as IUpdateAncillaryProductRequest);

            call$
                .pipe(
                    catchError(err => {
                        this._handleEditorError(err, isNew ? 'createProduct' : 'updateProduct');
                        resolve(false);
                        return EMPTY;
                    }),
                    finalize(() => this._isSaving.set(false))
                )
                .subscribe(saved => {
                    this._activeEditingProduct.set(saved);
                    if (isNew) {
                        // Promote from create → edit mode
                        this._editingProductId.set(saved.productId);
                    }
                    this._editorSuccess.set(
                        isNew
                            ? `"${saved.name}" has been added to the catalog.`
                            : `"${saved.name}" has been updated successfully.`
                    );
                    this._clearEditorSuccessAfterDelay();
                    resolve(true);
                });
        });
    }

    /** Clear all editor surface state — call on component destroy. */
    clearEditorState(): void {
        this._activeEditingProduct.set(null);
        this._editingProductId.set(null);
        this._editorError.set(null);
        this._editorSuccess.set(null);
        this._validationErrors.set({});
        this._isSaving.set(false);
        this._isLoadingEdit.set(false);
    }

    clearEditorError(): void {
        this._editorError.set(null);
    }


    // ── Navigation helpers ─────────────────────────────────────────────────

    navigateToNewProduct(): void {
        this.router.navigate([ANCILLARY_BASE, 'product-definition']);
    }

    navigateToEditProduct(productId: number): void {
        this.router.navigate([ANCILLARY_BASE, 'product-definition', productId]);
    }

    navigateToPricingReview(productId: number): void {
        this.router.navigate([ANCILLARY_BASE, 'pricing-review', productId]);
    }

    navigateToCatalog(): void {
        this.router.navigate([ANCILLARY_BASE]);
    }

    // ── Private helpers ────────────────────────────────────────────────────

    private _cancelActiveSub(): void {
        if (this._activeSub && !this._activeSub.closed) {
            this._activeSub.unsubscribe();
        }
        this._activeSub = null;
    }

    /**
     * Sophisticated error mapper — translates HTTP status codes and known
     * backend error strings into clear, operator-facing messages.
     */
    private _handleError(err: unknown, context: string): void {
        const httpErr = err as { status?: number; error?: { message?: string } };
        let message: string;

        switch (httpErr?.status) {
            case 400:
                message = httpErr.error?.message ??
                    'Invalid request data. Please review the product configuration.';
                break;
            case 401:
                message = 'Your session has expired. Please re-authenticate.';
                break;
            case 403:
                message = 'Access Denied — Catalog management requires elevated clearance.';
                break;
            case 404:
                message = 'The requested product could not be found in the catalog.';
                break;
            case 409:
                message = 'Conflict — this product is currently attached to active bookings.';
                break;
            case 422:
                message = httpErr.error?.message ??
                    'Validation failed: product parameters are outside permitted bounds.';
                break;
            case 500:
                message = 'A catalog engine fault occurred. Please contact operations support.';
                break;
            case 503:
                message = 'The catalog service is temporarily offline. Retry in a few moments.';
                break;
            default:
                message = httpErr.error?.message ??
                    `An unexpected error occurred during ${context}. Please try again.`;
        }

        console.error(`[AncillaryCatalogStore::${context}]`, err);
        this._error.set(message);
    }

    private _clearSuccessAfterDelay(): void {
        setTimeout(() => this._actionSuccess.set(null), 4000);
    }

    /**
       * Humanized error mapper for the Product Definition Center.
       * Converts technical HTTP codes into elegant operator-facing messages.
       */
    private _handleEditorError(err: unknown, context: string): void {
        const httpErr = err as { status?: number; error?: { message?: string } };
        let message: string;

        switch (httpErr?.status) {
            case 400:
                message = httpErr.error?.message ??
                    'The product configuration contains invalid data. Please review all fields before saving.';
                break;
            case 401:
                message = 'Your session has expired. Please sign in again to continue.';
                break;
            case 403:
                message = 'Access Denied — creating or updating products requires elevated permissions.';
                break;
            case 404:
                message = 'The product you are trying to edit no longer exists in the catalog.';
                break;
            case 409:
                message =
                    'Product name conflict — a catalog item with this name already exists. ' +
                    'Please use a distinct name to avoid ambiguity in passenger-facing displays.';
                break;
            case 422:
                message = httpErr.error?.message ??
                    'One or more product attributes failed validation. Check the name, category, and price fields.';
                break;
            case 500:
                message = 'A catalog service fault occurred. Your changes have not been saved. Contact operations support.';
                break;
            case 503:
                message = 'The catalog service is temporarily offline. Your session is preserved — retry in a few moments.';
                break;
            default:
                message = httpErr.error?.message ??
                    `An unexpected error occurred while saving the product (${context}). Please try again.`;
        }

        console.error(`[AncillaryCatalogStore::${context}]`, err);
        this._editorError.set(message);
    }

    private _clearEditorSuccessAfterDelay(): void {
        setTimeout(() => this._editorSuccess.set(null), 5000);
    }

    /**
      * Dedicated Pricing Review error handler — writes to `_reviewError` to
      * keep this surface isolated from catalog/editor error signals. A 404
      * is humanized into a graceful "Product Not Found" message for the
      * Ruby Red glass panel.
      */
    private _handleReviewError(err: unknown, context: string): void {
        const httpErr = err as { status?: number; error?: { message?: string } };
        let message: string;

        switch (httpErr?.status) {
            case 404:
                message =
                    'This product could not be found in the catalog. It may have been removed, ' +
                    'or the link you followed may be outdated.';
                break;
            case 401:
                message = 'Your session has expired. Please re-authenticate to view pricing intelligence.';
                break;
            case 403:
                message = 'Access Denied — Pricing Intelligence requires elevated clearance.';
                break;
            case 500:
                message = 'A catalog engine fault occurred while loading pricing data. Contact operations support.';
                break;
            case 503:
                message = 'The catalog service is temporarily offline. Retry in a few moments.';
                break;
            default:
                message = httpErr.error?.message ??
                    `An unexpected error occurred while loading pricing intelligence (${context}).`;
        }

        console.error(`[AncillaryCatalogStore::${context}]`, err);
        this._reviewError.set(message);
    }
}

// ── Pricing Review — Public interfaces & mock reference data ───────────────

/**
 * Mock category-average base prices (SGD), used purely for the contextual
 * market comparison engine until a real benchmarking endpoint exists.
 */
const CATEGORY_AVERAGE_PRICING: Record<string, number> = {
    Baggage: 45,
    Meal: 28,
    Comfort: 65,
    Lounge: 120,
    WiFi: 18,
    Insurance: 35,
    Other: 40,
};

const DEFAULT_CATEGORY_AVERAGE = 50;

export interface IMarketComparisonData {
    /** Mocked average base cost across the product's category. */
    categoryAverage: number;
    /** The reviewed product's current base cost. */
    currentPrice: number;
    /** % difference of currentPrice vs categoryAverage (signed). */
    percentDiff: number;
    /** Mocked system-wide popularity rank within the category (1 = most popular). */
    popularityRank: number;
    /** Mocked total number of SKUs in the category pool. */
    totalInCategory: number;
    /** Mocked profitability index, 0–100, for the luxury meter widget. */
    profitabilityIndex: number;
}

export type PricingHealthStatus = 'Optimized' | 'Under-priced' | 'Over-priced' | 'Unknown';

export interface IPricingTimelinePoint {
    label: string;
    price: number;
}



