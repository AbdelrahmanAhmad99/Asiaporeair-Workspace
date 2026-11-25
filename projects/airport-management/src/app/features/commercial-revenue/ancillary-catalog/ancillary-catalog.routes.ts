/**
 * ancillary-catalog.routes.ts
 * ──────────────────────────────────────────────────────────────────────────
 * Lazy-loaded routing for Commercial Revenue → Ancillary Catalog domain.
 * Breadcrumb context: Boutique Management > Global Catalog.
 * RBAC: SuperAdmin, Admin, Supervisor only.
 * ──────────────────────────────────────────────────────────────────────────
 */

import { Routes } from '@angular/router';

export const ANCILLARY_CATALOG_ROUTES: Routes = [
    {
        path: '',
        redirectTo: 'ancillary-catalog',
        pathMatch: 'full',
    },
    {
        path: 'ancillary-catalog',
        loadComponent: () =>
            import('./pages/ancillary-global-catalog/ancillary-global-catalog.component').then(
                m => m.AncillaryGlobalCatalogComponent
            ),
        title: 'Ancillary Catalog — Boutique Management | AOMS',

    },
    {
        path: 'product-definition',
        loadComponent: () =>
            import('./pages/product-definition-center/product-definition-center.component').then(
                m => m.ProductDefinitionCenterComponent
            ),
        title: 'Product Workshop | AOMS',

    },
    {
        path: 'product-definition/:id',
        loadComponent: () =>
            import('./pages/product-definition-center/product-definition-center.component').then(
                m => m.ProductDefinitionCenterComponent
            ),
        title: 'Product Workshop | AOMS',

    },
    {
        path: 'pricing-review/:id',
        loadComponent: () =>
            import('./pages/ancillary-pricing-review/ancillary-pricing-review.component').then(
                m => m.AncillaryPricingReviewComponent
            ),
        title: 'Pricing Review | Ancillary Catalog | AOMS',

    },
    {
        path: '**',
        redirectTo: '',
    },
];