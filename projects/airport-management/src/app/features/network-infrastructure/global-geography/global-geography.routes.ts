
import { Routes } from '@angular/router';

export const GLOBAL_GEOGRAPHY_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./pages/country-inventory/country-inventory.component').then(
                m => m.CountryInventoryComponent
            ),
        title: 'Country Inventory — AOMS',
    },
    {
        path: ':isoCode',
        loadComponent: () =>
            import('./pages/country-details/country-details.component').then(
                m => m.CountryDetailsComponent
            ),
        title: 'Country Details — AOMS',
    },
    {
        path: 'manage/:isoCode',
        loadComponent: () =>
            import('./pages/country-editor/country-editor.component').then(
                m => m.CountryEditorComponent
            ),
        title: 'Manage Country — AOMS',
    },
];