import {
    Component,
    HostListener,
    OnInit,
    OnDestroy,
    inject,
    signal,
    computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../features/authentication/services/auth.service';
import { AuthStateService } from '../../../core/auth/auth-state.service';

// ─── Mega-menu column data ────────────────────────────────────────────────────
interface MegaMenuLink {
    label: string;
    route?: string;
}

interface MegaMenuColumn {
    title: string;
    route?: string;
    links: MegaMenuLink[];
}

// ─── Component ────────────────────────────────────────────────────────────────
@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit, OnDestroy {

    // ─── Dependency Injection ────────────────────────────────────────────────
    private router = inject(Router);
    public authState = inject(AuthStateService);   // expose signals to template
    private authService = inject(AuthService);

    // ─── UI State Signals ────────────────────────────────────────────────────
    readonly isScrolled = signal<boolean>(false);
    readonly activeMenu = signal<string | null>(null);
    readonly isMobileMenuOpen = signal<boolean>(false);
    readonly isSearchOpen = signal<boolean>(false);
    readonly isMobileBookOpen = signal<boolean>(false); // mobile mega-menu accordion
    readonly isMobileManageOpen = signal<boolean>(false);
    readonly isMobileBoardingOpen = signal<boolean>(false);
    readonly isMobileJourneyOpen = signal<boolean>(false);

    /** Delay timer for mega-menu mouse-leave (prevents flicker) */
    private menuCloseTimer: ReturnType<typeof setTimeout> | null = null;

    // ─── Computed: user display name ─────────────────────────────────────────
    readonly userDisplayName = computed(() => {
        const user = this.authState.currentUser();
        if (!user) return null;
        const profile = user as any;
        return profile.firstName
            ? profile.firstName
            : profile.email
                ? (profile.email as string).split('@')[0]
                : 'Account';
    });

    // ─── Mega-Menu Data ──────────────────────────────────────────────────────
    readonly bookMegaMenu: MegaMenuColumn[] = [
        {
            title: 'Destinations',
            links: [
                { label: 'Popular Routes', route: '/flights/search' },
                { label: 'Asia Pacific', route: '/destinations/asia-pacific' },
                { label: 'Europe', route: '/destinations/europe' },
                { label: 'Americas', route: '/destinations/americas' },
                { label: 'Middle East & Africa', route: '/destinations/middle-east' },
            ],
        },
        {
            title: 'Deals & Offers',
            links: [
                { label: 'Flight Deals', route: '/offers/deals' },
                { label: 'Stopover Programme', route: '/offers/stopover' },
                { label: 'Companion Fares', route: '/offers/companion' },
                { label: 'Package Holidays', route: '/offers/packages' },
            ],
        },
        {
            title: 'Asiaporeair Loyalty',
            links: [
                { label: 'Join Loyalty', route: '/loyalty/loyalty-dashboard' },
                { label: 'Earn Miles', route: '/loyalty/earn' },
                { label: 'Redeem Miles', route: '/loyalty/redeem' },
                { label: 'Loyalty Tiers', route: '/loyalty/tiers' },
            ],
        },
        {
            title: 'Travel Preferences',
            links: [
                { label: 'Personal Information', route: '/profile/personal-info' },
                { label: 'Saved Passengers', route: '/profile/saved-passengers' },
                { label: 'Account Security', route: '/profile/account-security' },
                { label: 'Contact Information', route: '/profile/personal-info' },
            ],
        },
    ];

    readonly manageBookingMegaMenu: MegaMenuColumn[] = [
        {
            title: 'Manage Journey',
            links: [
                { label: 'My Trips', route: '/manage-booking/my-trips' },
                { label: 'Locate Your Journey', route: '/manage-booking/retrieve-booking' },
                { label: 'Electronic Ticket Lookup', route: '/manage-booking/retrieve-ticket' },
                { label: 'Journey Manifest', route: '/manage-booking/my-trips' },
            ],
        },
        {
            title: 'Check-in Services',
            links: [
                { label: 'Check-in Search', route: '/check-in/search' },
                { label: 'Boarding Confirmation', route: '/check-in/confirmation' },
                { label: 'Passenger Selection', route: '/check-in/passenger-selection' },
            ],
        },
        {
            title: 'Flight Information',
            links: [
                { label: 'Flight Search', route: '/flight-info/search' },
                { label: 'Live Flight Status', route: '/flight-info/status' },
                { label: 'Fares Directory', route: '/flight-info/fares' },
                // { label: 'Status Viewer', route: '/flight-info/status-viewer' },
            ],
        },
        {
            title: 'Booking Extras',
            links: [
                { label: 'Update Suite Manifest', route: '/manage-booking/retrieve-booking' },
                { label: 'Initiate Refund Process', route: '/manage-booking/retrieve-booking' },
                { label: 'Add Extra Services', route: '/manage-booking/retrieve-booking' },
                { label: 'Special Assistance', route: '/manage-booking/retrieve-booking' },
            ],
        },
    ];

    readonly boardingMegaMenu: MegaMenuColumn[] = [
        {
            title: 'Check-in',
            links: [
                { label: 'Online Check-in', route: '/boarding/check-in' },
                { label: 'Check-in Status', route: '/boarding/status' },
                { label: 'Kiosk Locations', route: '/boarding/kiosks' },
                { label: 'Mobile Boarding Pass', route: '/boarding/pass' },
            ],
        },
        {
            title: 'Baggage',
            links: [
                { label: 'Baggage Allowance', route: '/boarding/baggage-allowance' },
                { label: 'Delayed / Damaged Bags', route: '/boarding/baggage-issues' },
                { label: 'Prohibited Items', route: '/boarding/prohibited' },
                { label: 'Track My Bags', route: '/boarding/track-bags' },
            ],
        },
        {
            title: 'At the Airport',
            links: [
                { label: 'Lounge Access', route: '/boarding/lounges' },
                { label: 'Fast Track Security', route: '/boarding/fast-track' },
                { label: 'Airport Transfer', route: '/boarding/transfer' },
                { label: 'Premium Services', route: '/boarding/premium' },
            ],
        },
        {
            title: 'In-flight',
            links: [
                { label: 'Wi-Fi & Connectivity', route: '/boarding/wifi' },
                { label: 'In-flight Entertainment', route: '/boarding/entertainment' },
                { label: 'Duty-Free (KrisShop)', route: '/boarding/duty-free' },
                { label: 'Cabin Services', route: '/boarding/cabin' },
            ],
        },
    ];

    readonly journeyMegaMenu: MegaMenuColumn[] = [
        {
            title: 'Cabin Experience',
            route: '/journey-with-us/cabins',
            links: [
                { label: 'Suites', route: '/journey-with-us/cabins/suites' },
                { label: 'First Class', route: '/journey-with-us/cabins/first-class' },
                { label: 'Business Class', route: '/journey-with-us/cabins/business-class' },
                { label: 'Premium Economy', route: '/journey-with-us/cabins/premium-economy' },
                { label: 'Economy Class', route: '/journey-with-us/cabins/economy' },
            ],
        },
        {
            title: 'Dining & Menus',
            route: '/journey-with-us/dining',
            links: [
                { label: 'Dining Overview', route: '/journey-with-us/dining' },
                { label: 'Book the Cook', route: '/journey-with-us/dining/book-the-cook' },
                { label: 'Culinary Experts', route: '/journey-with-us/dining/culinary-experts' },
                { label: 'Inflight Menus', route: '/journey-with-us/dining/inflight-menus' },
            ],
        },
        {
            title: 'Entertainment & Shopping',
            route: '/journey-with-us/entertainment',
            links: [
                { label: 'SkyWorld Entertainment', route: '/journey-with-us/entertainment/krisworld' },
                { label: 'Wi-Fi & Connectivity', route: '/journey-with-us/entertainment/wifi-connectivity' },
                { label: 'Inflight Shopping', route: '/journey-with-us/before-the-flight/inflight-shopping' },
                { label: 'Airport Experience', route: '/journey-with-us/before-the-flight/airport-experience' },
                { label: 'Silverkris Lounges', route: '/journey-with-us/before-the-flight/silver-lounges' },
            ],
        },
        {
            title: 'Our Story',
            route: '/journey-with-us/our-story',
            links: [
                { label: 'Our Heritage', route: '/journey-with-us/our-story/heritage' },
                { label: 'Our Fleet', route: '/journey-with-us/our-story/our-fleet' },
                { label: 'Awards & Recognition', route: '/journey-with-us/our-story/awards' },
                { label: 'Our Cabin Crew', route: '/journey-with-us/our-story/cabin-crew' },
            ],
        },
    ];

    // ─── Lifecycle ───────────────────────────────────────────────────────────

    ngOnInit(): void { }

    ngOnDestroy(): void {
        if (this.menuCloseTimer) clearTimeout(this.menuCloseTimer);
    }

    // ─── Scroll Detection ────────────────────────────────────────────────────

    @HostListener('window:scroll')
    onWindowScroll(): void {
        this.isScrolled.set(window.scrollY > 20);
    }

    // ─── Outside Click ───────────────────────────────────────────────────────

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: Event): void {
        const target = event.target as HTMLElement;
        if (!target.closest('.navbar')) {
            this.activeMenu.set(null);
            this.isSearchOpen.set(false);
        }
    }

    // ─── Mega-Menu Handlers ──────────────────────────────────────────────────

    openMegaMenu(name: string): void {
        if (this.menuCloseTimer) {
            clearTimeout(this.menuCloseTimer);
            this.menuCloseTimer = null;
        }
        this.activeMenu.set(name);
    }

    scheduleMegaMenuClose(): void {
        this.menuCloseTimer = setTimeout(() => {
            this.activeMenu.set(null);
        }, 180);
    }

    cancelMegaMenuClose(): void {
        if (this.menuCloseTimer) {
            clearTimeout(this.menuCloseTimer);
            this.menuCloseTimer = null;
        }
    }

    closeMegaMenu(): void {
        this.activeMenu.set(null);
        if (this.menuCloseTimer) clearTimeout(this.menuCloseTimer);
    }

    // ─── Mobile Handlers ─────────────────────────────────────────────────────

    toggleMobileMenu(): void {
        this.isMobileMenuOpen.update(v => !v);
        // Prevent body scroll when mobile menu is open
        document.body.style.overflow = this.isMobileMenuOpen() ? 'hidden' : '';
    }

    closeMobileMenu(): void {
        this.isMobileMenuOpen.set(false);
        document.body.style.overflow = '';
    }

    toggleMobileBook(): void {
        this.isMobileBookOpen.update(v => !v);
    }

    toggleMobileManage(): void {
        this.isMobileManageOpen.update(v => !v);
    }

    toggleMobileBoarding(): void {
        this.isMobileBoardingOpen.update(v => !v);
    }

    toggleMobileJourney(): void {
        this.isMobileJourneyOpen.update(v => !v);
    }

    // ─── Search Handlers ─────────────────────────────────────────────────────

    toggleSearch(): void {
        this.isSearchOpen.update(v => !v);
    }

    closeSearch(): void {
        this.isSearchOpen.set(false);
    }

    // ─── Auth Handlers ───────────────────────────────────────────────────────

    navigateToLogin(): void {
        this.router.navigate(['/auth/login']);
        this.closeMobileMenu();
    }

    navigateToRegister(): void {
        this.router.navigate(['/auth/signup']);
        this.closeMobileMenu();
    }

    logout(): void {
        this.authService.logout();
        this.closeMobileMenu();
    }
}
