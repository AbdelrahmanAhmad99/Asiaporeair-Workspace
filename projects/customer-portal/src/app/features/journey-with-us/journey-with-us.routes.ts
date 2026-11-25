// ============================================================================
// journey-with-us.routes.ts
// Asiaporeair | Journey With Us — Nested Lazy-Loaded Feature Routes
// ============================================================================

import { Routes } from '@angular/router';

export const JOURNEY_WITH_US_ROUTES: Routes = [
    {
        path: '',
        redirectTo: 'landing',
        pathMatch: 'full'
    },
    {
        path: 'landing',
        loadComponent: () =>
            import('./journey/pages/journey-landing/journey-landing.component')
                .then(m => m.JourneyLandingComponent),
        title: 'Journey With Us | Asiaporeair'
    },
    {
        path: 'cabins',
        children: [
            {
                path: '',
                loadComponent: () =>
                    import('./cabins/pages/cabins-landing/cabins-landing.component')
                        .then(m => m.CabinsLandingComponent),
                title: 'Cabins | Asiaporeair'
            },
            {
                path: 'suites',
                loadComponent: () =>
                    import('./cabins/pages/cabin-detail/cabin-detail.component')
                        .then(m => m.CabinDetailComponent),
                data: { cabinKey: 'suites' },
                title: 'Suites | Asiaporeair'
            },
            {
                path: 'first-class',
                loadComponent: () =>
                    import('./cabins/pages/cabin-detail/cabin-detail.component')
                        .then(m => m.CabinDetailComponent),
                data: { cabinKey: 'first-class' },
                title: 'First Class | Asiaporeair'
            },
            {
                path: 'business-class',
                loadComponent: () =>
                    import('./cabins/pages/cabin-detail/cabin-detail.component')
                        .then(m => m.CabinDetailComponent),
                data: { cabinKey: 'business-class' },
                title: 'Business Class | Asiaporeair'
            },
            {
                path: 'premium-economy',
                loadComponent: () =>
                    import('./cabins/pages/cabin-detail/cabin-detail.component')
                        .then(m => m.CabinDetailComponent),
                data: { cabinKey: 'premium-economy' },
                title: 'Premium Economy | Asiaporeair'
            },
            {
                path: 'economy',
                loadComponent: () =>
                    import('./cabins/pages/cabin-detail/cabin-detail.component')
                        .then(m => m.CabinDetailComponent),
                data: { cabinKey: 'economy' },
                title: 'Economy Class | Asiaporeair'
            }
        ]
    },
    {
        path: 'dining',
        children: [
            {
                path: '',
                loadComponent: () =>
                    import('./dining/pages/dining-landing/dining-landing.component')
                        .then(m => m.DiningLandingComponent),
                title: 'Dining | Asiaporeair'
            },
            {
                path: 'book-the-cook',
                loadComponent: () =>
                    import('./dining/pages/book-the-cook/book-the-cook.component')
                        .then(m => m.BookTheCookComponent),
                title: 'Book the Cook | Asiaporeair'
            },
            {
                path: 'culinary-experts',
                loadComponent: () =>
                    import('./dining/pages/culinary-experts/culinary-experts.component')
                        .then(m => m.CulinaryExpertsComponent),
                title: 'Culinary Experts | Asiaporeair'
            },
            {
                path: 'inflight-menus',
                loadComponent: () =>
                    import('./dining/pages/inflight-menus/inflight-menus.component')
                        .then(m => m.InflightMenusComponent),
                title: 'Inflight Menus | Asiaporeair'
            }
        ]
    },

    {
        path: 'before-the-flight',
        children: [
            {
                path: '',
                loadComponent: () =>
                    import('./before-the-flight/pages/before-the-flight-landing/before-the-flight-landing.component')
                        .then(m => m.BeforeTheFlightLandingComponent),
                title: 'Before the Flight | Asiaporeair'
            },
            {
                path: 'silver-lounges',
                loadComponent: () =>
                    import('./before-the-flight/pages/silverkris-lounges/silverkris-lounges.component')
                        .then(m => m.SilverkrisLoungesComponent),
                title: 'Silver Lounges | Asiaporeair'
            },
            {
                path: 'inflight-shopping',
                loadComponent: () =>
                    import('./before-the-flight/pages/inflight-shopping/inflight-shopping.component')
                        .then(m => m.InflightShoppingComponent),
                title: 'Inflight Shopping | Asiaporeair'
            },
            {
                path: 'airport-experience',
                loadComponent: () =>
                    import('./before-the-flight/pages/airport-experience/airport-experience.component')
                        .then(m => m.AirportExperienceComponent),
                title: 'Airport Experience | Asiaporeair'
            }
        ]
    },
    {
        path: 'our-story',
        children: [
            {
                path: '',
                loadComponent: () =>
                    import('./our-story/pages/our-story-landing/our-story-landing.component')
                        .then(m => m.OurStoryLandingComponent),
                title: 'Our Story | Asiaporeair'
            },
            {
                path: 'heritage',
                loadComponent: () =>
                    import('./our-story/pages/heritage/heritage.component')
                        .then(m => m.HeritageComponent),
                title: 'Our Heritage | Asiaporeair'
            },
            {
                path: 'our-fleet',
                loadComponent: () =>
                    import('./our-story/pages/our-fleet/our-fleet.component')
                        .then(m => m.OurFleetComponent),
                title: 'Our Fleet | Asiaporeair'
            },
            {
                path: 'awards',
                loadComponent: () =>
                    import('./our-story/pages/awards/awards.component')
                        .then(m => m.AwardsComponent),
                title: 'Awards & Recognition | Asiaporeair'
            },
            {
                path: 'cabin-crew',
                loadComponent: () =>
                    import('./our-story/pages/cabin-crew/cabin-crew.component')
                        .then(m => m.CabinCrewComponent),
                title: 'Our Cabin Crew | Asiaporeair'
            }
        ]
    },
    {
        path: 'entertainment',
        children: [
            {
                path: '',
                loadComponent: () =>
                    import('./entertainment/pages/entertainment-landing/entertainment-landing.component')
                        .then(m => m.EntertainmentLandingComponent),
                title: 'Entertainment | Asiaporeair'
            },
            {
                path: 'krisworld',
                loadComponent: () =>
                    import('./entertainment/pages/krisworld/krisworld.component')
                        .then(m => m.KrisworldComponent),
                title: 'SkyWorld Entertainment | Asiaporeair'
            },
            {
                path: 'wifi-connectivity',
                loadComponent: () =>
                    import('./entertainment/pages/wifi-connectivity/wifi-connectivity.component')
                        .then(m => m.WifiConnectivityComponent),
                title: 'Wi-Fi Connectivity | Asiaporeair'
            }
        ]
    }

];