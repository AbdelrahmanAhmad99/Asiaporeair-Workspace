// ============================================================================
// loyalty.routes.ts
// Asiaporeair | Routing — Frequent Flyer & Loyalty Feature Module
// ============================================================================
import { Routes } from '@angular/router';

export const LOYALTY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./loyalty-dashboard/pages/loyalty-dashboard/loyalty-dashboard.component').then(
        m => m.LoyaltyDashboardComponent
      ),
    title: 'Loyalty Dashboard | Asiaporeair',
  },
  {
    path: 'loyalty-dashboard',
    loadComponent: () =>
      import('./loyalty-dashboard/pages/loyalty-dashboard/loyalty-dashboard.component').then(
        m => m.LoyaltyDashboardComponent
      ),
    title: 'Loyalty Dashboard | Asiaporeair',
  },
  {
    path: 'points-history',
    loadComponent: () =>
      import('./loyalty-dashboard/pages/loyalty-dashboard/loyalty-dashboard.component').then(
        m => m.LoyaltyDashboardComponent
      ),
    title: 'Points History | Asiaporeair',
  },
  {
    path: 'tier-benefits',
    loadComponent: () =>
      import('./loyalty-dashboard/pages/loyalty-dashboard/loyalty-dashboard.component').then(
        m => m.LoyaltyDashboardComponent
      ),
    title: 'Tier Benefits | Asiaporeair',
  },
  {
    path: 'redeem-miles',
    loadComponent: () =>
      import('./loyalty-dashboard/pages/loyalty-dashboard/loyalty-dashboard.component').then(
        m => m.LoyaltyDashboardComponent
      ),
    title: 'Redeem Miles | Asiaporeair',
  },
];
