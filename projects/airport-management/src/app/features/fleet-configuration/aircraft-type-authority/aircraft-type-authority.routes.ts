

import { Routes } from '@angular/router';

export const AIRCRAFT_TYPE_AUTHORITY_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./pages/type-catalog-dashboard/type-catalog-dashboard.component').then(
                m => m.TypeCatalogDashboardComponent
            ),
        title: 'Aircraft Type Catalog — AOMS Fleet Authority',
    },
    {

        path: 'details/:id',
        loadComponent: () =>
            import('./pages/type-specification-detail/type-specification-detail.component').then(
                m => m.TypeSpecificationDetailComponent
            ),
        title: 'Type Specifications — AOMS Fleet Authority',
    },
    {
        path: 'editor',
        loadComponent: () =>
            import('./pages/type-editor-wizard/type-editor-wizard.component').then(
                m => m.TypeEditorWizardComponent
            ),
        title: 'New Aircraft Type — AOMS Fleet Authority',
    },
    {

        path: 'editor/:id',
        loadComponent: () =>
            import('./pages/type-editor-wizard/type-editor-wizard.component').then(
                m => m.TypeEditorWizardComponent
            ),
        title: 'Edit Aircraft Type — AOMS Fleet Authority',
    },
    {
        path: 'archive',
        loadComponent: () =>
            import('./pages/type-archive-manager/type-archive-manager.component').then(
                m => m.TypeArchiveManagerComponent
            ),
        title: 'Type Archive — AOMS Fleet Authority',
    },
    {
        path: 'range-analyzer',
        loadComponent: () =>
            import('./pages/fleet-range-analyzer/fleet-range-analyzer.component').then(
                m => m.FleetRangeAnalyzerComponent
            ),
        title: 'Fleet Range Analyzer — AOMS Fleet Authority',
    },
    {
        path: 'type-archive-manager',
        loadComponent: () =>
            import('./pages/type-archive-manager/type-archive-manager.component').then(
                m => m.TypeArchiveManagerComponent
            ),
        title: 'Type Archive Manager — AOMS Fleet Authority',
    },
    {
        path: '**',
        redirectTo: '',
    },
];