
import { Routes } from '@angular/router';

export const AIRLINE_PARTNERSHIP_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/airline-dashboard/airline-dashboard.component').then(
        m => m.AirlineDashboardComponent
      ),
    title: 'Partner Fleet Management · AOMS',

  },
  {
    path: 'details/:iataCode',
    loadComponent: () =>
      import('./pages/airline-details/airline-details.component').then(
        m => m.AirlineDetailsComponent
      ),
    title: 'Partner Profile · AOMS',

  },
  {
    path: 'manage/new',
    loadComponent: () =>
      import('./pages/airline-management-form/airline-management-form.component').then(
        m => m.AirlineManagementFormComponent
      ),
    title: 'Onboard New Partner · AOMS',

  },
  {
    path: 'manage/:iataCode',
    loadComponent: () =>
      import('./pages/airline-management-form/airline-management-form.component').then(
        m => m.AirlineManagementFormComponent
      ),
    title: 'Edit Partner Configuration · AOMS',

  },
  {
    path: 'audit-center',
    loadComponent: () =>
      import('./pages/airline-audit-center/airline-audit-center.component').then(
        m => m.AirlineAuditCenterComponent
      ),
    title: 'Partner Audit Center · AOMS',

  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];