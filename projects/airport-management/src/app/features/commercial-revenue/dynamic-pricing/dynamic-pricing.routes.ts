/**
 * dynamic-pricing.routes.ts
 * ──────────────────────────────────────────────────────────────────────────
 * Lazy-loaded routing for the Commercial Revenue → Dynamic Pricing domain.
 * RBAC: Accessible only to SuperAdmin, Admin, Supervisor roles.
 * ──────────────────────────────────────────────────────────────────────────
 */

import { Routes } from '@angular/router';

export const DYNAMIC_PRICING_ROUTES: Routes = [
    {
        path: '',
        redirectTo: 'pricing-attribute-manager',
        pathMatch: 'full',
    },
    {
        path: 'pricing-attribute-manager',
        loadComponent: () =>
            import('./pages/pricing-attribute-manager/pricing-attribute-manager.component').then(
                m => m.PricingAttributeManagerComponent
            ),
        title: 'Dynamic Pricing — Attribute Manager | AOMS',
    },
    {
        path: 'dynamic-rule-editor',
        loadComponent: () =>
            import('./pages/dynamic-rule-editor/dynamic-rule-editor.component').then(
                m => m.DynamicRuleEditorComponent
            ),
        title: 'Create Rule | Dynamic Pricing | AOMS',
    },
    {
        path: 'dynamic-rule-editor/:id',
        loadComponent: () =>
            import('./pages/dynamic-rule-editor/dynamic-rule-editor.component').then(
                m => m.DynamicRuleEditorComponent
            ),
        title: 'Edit Pricing Rule | Dynamic Pricing | AOMS',
    },
    {
        path: 'rule-simulation-lab',
        loadComponent: () =>
            import('./pages/rule-simulation-lab/rule-simulation-lab.component').then(
                m => m.RuleSimulationLabComponent
            ),
        title: 'Simulation Lab | Dynamic Pricing | AOMS',
    },
    {
        path: 'pricing-attribute-archive',
        loadComponent: () =>
            import('./pages/pricing-attribute-archive/pricing-attribute-archive.component').then(
                m => m.PricingAttributeArchiveComponent
            ),
        title: 'Pricing Archive | Dynamic Pricing | AOMS',
    },
    {
        path: '**',
        redirectTo: '',
    },
];