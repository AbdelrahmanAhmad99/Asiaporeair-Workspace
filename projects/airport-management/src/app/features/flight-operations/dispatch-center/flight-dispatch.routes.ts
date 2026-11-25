
import { Routes } from '@angular/router';

export const FLIGHT_DISPATCH_ROUTES: Routes = [
    {
        path: '',
        redirectTo: 'flight-instance-control-room',
        pathMatch: 'full',
    },
    {
        path: 'flight-instance-control-room',
        loadComponent: () =>
            import('./pages/flight-instance-control-room/flight-instance-control-room.component').then(
                m => m.FlightInstanceControlRoomComponent
            ),
        title: 'Flight Instance Control Room · AOMS',

    },
    {
        path: 'aircraft-assignment-hub',
        loadComponent: () =>
            import('./pages/aircraft-assignment-hub/aircraft-assignment-hub.component').then(
                m => m.AircraftAssignmentHubComponent
            ),
        title: 'Aircraft Assignment Hub · AOMS',

    },
    {
        path: 'aircraft-assignment-hub/:instanceId',
        loadComponent: () =>
            import('./pages/aircraft-assignment-hub/aircraft-assignment-hub.component').then(
                m => m.AircraftAssignmentHubComponent
            ),
        title: 'Assign Aircraft · AOMS',

    },
    {
        path: 'ad-hoc-creator',
        loadComponent: () =>
            import('./pages/ad-hoc-flight-creator/ad-hoc-flight-creator.component').then(
                m => m.AdHocFlightCreatorComponent
            ),
        title: 'Ad-Hoc Mission Creator · AOMS',

    },
    {
        path: 'bulk-generator',
        loadComponent: () =>
            import('./pages/bulk-instance-generator/bulk-instance-generator.component').then(
                m => m.BulkInstanceGeneratorComponent
            ),
        title: 'Bulk Instance Generator · AOMS',

    },
    {
        path: '**',
        redirectTo: 'flight-instance-control-room',
    },
];