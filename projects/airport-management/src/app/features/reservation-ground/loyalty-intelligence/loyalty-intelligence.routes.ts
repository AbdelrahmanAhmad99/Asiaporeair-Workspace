import { Routes } from '@angular/router';

export const LOYALTY_INTELLIGENCE_ROUTES: Routes = [
    {
        path: '',
        redirectTo: 'account-manager',
        pathMatch: 'full',
    },
    {
        path: 'account-manager',
        loadComponent: () =>
            import('./pages/loyalty-account-manager/loyalty-account-manager.component').then(
                m => m.LoyaltyAccountManagerComponent
            ),
        title: 'Loyalty Account Manager — AOMS',

    },
    {
        path: 'register-member',
        loadComponent: () =>
            import('./pages/membership-registration-center/membership-registration-center.component').then(
                m => m.MembershipRegistrationCenterComponent
            ),
        title: 'Membership Registration — AOMS',
    },
    {
        path: 'points-desk/:userId',
        loadComponent: () =>
            import('./pages/point-adjustment-desk/point-adjustment-desk.component').then(
                m => m.PointAdjustmentDeskComponent
            ),
        title: 'Point Adjustment Desk — AOMS',
    },
    {
        path: 'points-desk',
        loadComponent: () =>
            import('./pages/point-adjustment-desk/point-adjustment-desk.component').then(
                m => m.PointAdjustmentDeskComponent
            ),
        title: 'Point Adjustment Desk — AOMS',
    },

    {
        path: '**',
        redirectTo: 'account-manager',
    },
];