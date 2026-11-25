
import { Routes } from '@angular/router';

const FINANCIAL_ADMIN_ROLES = ['SuperAdmin', 'Admin', 'FinancialAdmin'];

export const FINANCIAL_HUB_ROUTES: Routes = [
    {
        path: '',
        redirectTo: 'global-payment-auditor',
        pathMatch: 'full',
    },
    {
        path: 'global-payment-auditor',
        loadComponent: () =>
            import('./pages/global-payment-auditor/global-payment-auditor.component').then(
                m => m.GlobalPaymentAuditorComponent
            ),
        title: 'Global Payment Auditor | AOMS',

    },
    {
        path: 'refund-terminal',
        loadComponent: () =>
            import('./pages/refund-processing-terminal/refund-processing-terminal.component').then(
                m => m.RefundProcessingTerminalComponent
            ),
        title: 'Refund Terminal & Credit Management | AOMS',

    },
    {
        path: 'refund-terminal/:transactionId',
        loadComponent: () =>
            import('./pages/refund-processing-terminal/refund-processing-terminal.component').then(
                m => m.RefundProcessingTerminalComponent
            ),
        title: 'Refund Terminal & Credit Management | AOMS',

    },
    {
        path: 'executive-dashboard',
        loadComponent: () =>
            import('./pages/executive-revenue-dashboard/executive-revenue-dashboard.component').then(
                m => m.ExecutiveRevenueDashboardComponent
            ),
        title: 'Revenue Overview | AOMS',

    },
    {
        path: '**',
        redirectTo: 'global-payment-auditor',
    },
];