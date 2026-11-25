
import { Routes } from '@angular/router';

export const WORKFORCE_ANALYTICS_ROUTES: Routes = [
    {
        path: '',
        redirectTo: 'enterprise-dashboard',
        pathMatch: 'full',
    },
    {
        path: 'enterprise-dashboard',
        loadComponent: () =>
            import('./pages/enterprise-workforce-dashboard/enterprise-workforce-dashboard.component')
                .then(m => m.EnterpriseWorkforceDashboardComponent),
        title: 'Enterprise Workforce Dashboard — AOMS',
    },
    {
        path: 'crew-intelligence',
        loadComponent: () =>
            import('./pages/crew-intelligence-hub/crew-intelligence-hub.component')
                .then(m => m.CrewIntelligenceHubComponent),
        title: 'Crew Intelligence Hub — AOMS',
    },
    {
        path: 'recruitment-trends',
        loadComponent: () =>
            import('./pages/recruitment-trends-report/recruitment-trends-report.component')
                .then(m => m.RecruitmentTrendsReportComponent),
        title: 'Recruitment Trends — AOMS',
    },
    { path: '**', redirectTo: 'enterprise-dashboard' },
];