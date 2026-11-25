/**
 * fare-engine.routes.ts
 * ──────────────────────────────────────────────────────────────────────────
 * Lazy-loaded routing for the Commercial Revenue → Fare Engine domain.
 * Accessible only to roles: SuperAdmin, Admin, Supervisor (RBAC via CanMatch).
 * ──────────────────────────────────────────────────────────────────────────
 */

import { Routes } from '@angular/router';

export const FARE_ENGINE_ROUTES: Routes = [
    {
        path: '',
        redirectTo: 'fare-basis-inventory',
        pathMatch: 'full',
    },
    {
        path: 'fare-basis-inventory',
        loadComponent: () =>
            import('./pages/fare-basis-inventory/fare-basis-inventory.component').then(
                m => m.FareBasisInventoryComponent
            ),
        title: 'Fare Engine — Pricing Command Center | AOMS',
    },
    {
        path: 'configurator',
        loadComponent: () =>
            import('./pages/fare-policy-configurator/fare-policy-configurator.component').then(
                m => m.FarePolicyConfiguratorComponent
            ),
        title: 'Policy Configurator | Fare Engine | AOMS',
    },
    {
        path: 'configurator/:code',
        loadComponent: () =>
            import('./pages/fare-policy-configurator/fare-policy-configurator.component').then(
                m => m.FarePolicyConfiguratorComponent
            ),
        title: 'Edit Fare Policy | Fare Engine | AOMS',
    },
    {
        path: 'audit-archive',
        loadComponent: () =>
            import('./pages/fare-audit-archive/fare-audit-archive.component').then(
                m => m.FareAuditArchiveComponent
            ),
        title: 'Audit Archive | Fare Engine | AOMS',
    },
    {
        path: '**',
        redirectTo: '',
    },
];