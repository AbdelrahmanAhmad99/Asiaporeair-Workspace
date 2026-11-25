
import { Routes } from '@angular/router';

export const TACTICAL_TRC_ROUTES: Routes = [
    {
        path: '',
        redirectTo: 'roster-planner',
        pathMatch: 'full',
    },
    {
        path: 'roster-planner',
        loadComponent: () =>
            import('./pages/flight-roster-planner/flight-roster-planner.component')
                .then(m => m.FlightRosterPlannerComponent),
        title: 'Flight Roster Planner — AOMS',
    },
    {
        path: 'roster-planner/:flightId',
        loadComponent: () =>
            import('./pages/flight-roster-planner/flight-roster-planner.component')
                .then(m => m.FlightRosterPlannerComponent),
        title: 'Flight Roster — AOMS',
    },
    {
        path: 'availability-explorer',
        loadComponent: () =>
            import('./pages/availability-explorer-hub/availability-explorer-hub.component')
                .then(m => m.AvailabilityExplorerHubComponent),
        title: 'Availability Explorer — AOMS',
    },
    {
        path: 'personal-schedule/:id',
        loadComponent: () =>
            import('./pages/personal-duty-visualizer/personal-duty-visualizer.component')
                .then(m => m.PersonalDutyVisualizerComponent),
        title: 'Personal Duty Schedule — AOMS',
    },
    { path: '**', redirectTo: 'roster-planner' },
];