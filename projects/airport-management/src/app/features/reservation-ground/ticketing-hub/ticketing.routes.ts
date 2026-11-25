import { Routes } from '@angular/router';

export const TICKETING_ROUTES: Routes = [
    {
        path: '',
        redirectTo: 'audit-vault',
        pathMatch: 'full',
    },
    {
        path: 'issuance/:bookingId',
        loadComponent: () =>
            import('./pages/ticket-issuance-console/ticket-issuance-console.component').then(
                m => m.TicketIssuanceConsoleComponent
            ),
        title: 'Ticket Issuance Console — AOMS',
    },
    {
        path: 'audit-vault',
        loadComponent: () =>
            import('./pages/audit-ticket-vault/audit-ticket-vault.component').then(
                m => m.AuditTicketVaultComponent
            ),
        title: 'Audit Ticket Vault — AOMS',
    },
    {
        path: 'lifecycle/:id',
        loadComponent: () =>
            import('./pages/ticket-lifecycle-manager/ticket-lifecycle-manager.component').then(
                m => m.TicketLifecycleManagerComponent
            ),
        title: 'Ticket Lifecycle Manager — AOMS',
        data: {
            breadcrumb: 'Lifecycle Manager',
            requiredRoles: ['SuperAdmin', 'Admin', 'Supervisor'],
        },
    },
    {
        path: '**',
        redirectTo: 'audit-vault',
    },
];