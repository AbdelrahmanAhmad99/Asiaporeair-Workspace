// ============================================================================
// journey-with-us.models.ts
// Asiaporeair | Journey With Us — Shared Domain Models & Data
// ============================================================================

// ── Hub Section Card ──────────────────────────────────────────────────────────
export interface IJourneyHubSection {
    id: string;
    title: string;
    tagline: string;
    description: string;
    imagePath: string;
    route: string;
    accentColor: string;
}

// ── Cabin Feature Card ────────────────────────────────────────────────────────
export interface ICabinFeatureCard {
    id: string;
    title: string;
    tagline: string;
    description: string;
    imagePath: string;
    route: string;
    badge?: string;
    specs: {
        label: string;
        value: string;
    }[];
}

// ── Cabin Detail (for cabin detail page) ──────────────────────────────────────
export interface ICabinDetail {
    key: string;
    title: string;
    subtitle: string;
    aircraft: string;
    heroImage: string;
    galleryImages: string[];
    amenities: IAmenityItem[];
    virtualTourLabel: string;
}

export interface IAmenityItem {
    id: string;
    icon: string; // SVG path string
    title: string;
    body: string;
    highlight?: string;
}



// ════════════════════════════════════════════════════════════════════════════
// DINING MODULE — Interfaces & Data
// ════════════════════════════════════════════════════════════════════════════

// ── Dish / Meal Card ─────────────────────────────────────────────────────────
export interface IDishItem {
    id: string;
    name: string;
    description: string;
    imagePath: string;
    cabinClass: 'suites' | 'first' | 'business' | 'premium-economy' | 'economy' | 'all';
    course: 'starter' | 'main' | 'dessert' | 'beverage';
    dietary?: ('vegetarian' | 'vegan' | 'halal' | 'gluten-free')[];
    chefId?: string; // links to IChefProfile
    highlight?: string; // e.g. "Chef's Signature"
}

// ── Chef / Culinary Expert Profile ────────────────────────────────────────────
export interface IChefProfile {
    id: string;
    name: string;
    title: string;        // e.g. "Executive Chef, Restaurant Atelier"
    nationality: string;
    imagePath: string;
    quote: string;
    signatureDish: string;
    awards?: string[];
}

// ── Inflight Menu Group ────────────────────────────────────────────────────────
export interface IInflightMenuGroup {
    id: string;
    cabinClass: string;
    imagePath: string;
    menuLabel: string;
    description: string;
    route: string;
}

// ── Special Meal Type ──────────────────────────────────────────────────────────
export interface ISpecialMealType {
    id: string;
    code: string;  // e.g. "VGML"
    name: string;  // e.g. "Vegan Meal"
    description: string;
    icon: string;  // SVG path string
}

// ════════════════════════════════════════════════════════════════════════════
// BEFORE THE FLIGHT MODULE — Interfaces & Data
// ════════════════════════════════════════════════════════════════════════════

// ── Lounge Facility Icon ──────────────────────────────────────────────────────
export interface ILoungeFacility {
    id: string;
    iconPath: string;  // SVG d="" path string (thin line-art)
    title: string;
    description: string;
}

// ── Lounge Access Tier ─────────────────────────────────────────────────────────
export interface ILoungeAccessTier {
    cabinOrTier: string;    // e.g. "Suites & First Class"
    lounge: string;    // e.g. "The Private Room"
    benefits: string[];  // e.g. ["Butler service", "À la carte dining"]
    badge?: 'gold' | 'silver' | 'standard'; // visual styling hint
}

// ── Airport Experience Feature ─────────────────────────────────────────────────
export interface IAirportFeature {
    id: string;
    title: string;
    description: string;
    imagePath: string;
    icon: string; // SVG path string
}

// ── Shopping Product Preview ───────────────────────────────────────────────────
export interface IShoppingItem {
    id: string;
    name: string;
    brand: string;
    category: 'fragrance' | 'skincare' | 'fashion' | 'electronics' | 'spirits' | 'jewellery';
    imagePath: string;
    tagline: string;
    exclusive: boolean; // exclusive to Asiaporeair inflight shopping
}




// ════════════════════════════════════════════════════════════════════════════
// OUR STORY MODULE — Interfaces
// ════════════════════════════════════════════════════════════════════════════

/**
 * A single node on the heritage timeline.
 */
export interface ITimelineEvent {
    id: string;
    year: number;
    title: string;
    description: string;
    imagePath?: string;   // optional vintage photo
    badge?: string;   // e.g. "First Flight", "New Route"
    isHighlight: boolean;  // renders larger / gold-accented
}

/**
 * A vintage photograph displayed in a premium thin-bordered frame.
 */
export interface IVintagePhoto {
    id: string;
    imagePath: string;
    caption: string;
    year: number;
    altText: string;
}

/**
 * An award or industry recognition.
 */
export interface IAwardItem {
    id: string;
    title: string;       // e.g. "World's Best Airline"
    organisation: string;       // e.g. "Skytrax World Airline Awards"
    year: number;
    category: string;       // e.g. "Overall", "Cabin Staff", "Business Class"
    consecutive?: number;       // e.g. 5 — "5 consecutive years"
    iconType: 'star' | 'trophy' | 'ribbon' | 'globe'; // drives SVG shape
    isGrand: boolean;      // grand/headline award — larger treatment
}

/**
 * A fleet aircraft model.
 */
export interface IFleetData {
    id: string;
    model: string;       // e.g. "Airbus A380-800"
    nickname: string;       // e.g. "The Superjumbo"
    imagePath: string;
    range: string;       // e.g. "15,200 km"
    maxPassengers: number;
    cabins: string[];     // e.g. ["Suites", "Business", "Economy"]
    entered: number;       // year entered service
    highlight: string;       // one distinguishing sentence
    badge?: string;
}

/**
 * A cabin crew member spotlight card.
 */
export interface ICrewSpotlight {
    id: string;
    name: string;
    role: string;       // e.g. "Senior Flight Stewardess"
    yearsOfService: number;
    imagePath: string;
    quote: string;
    baseCity: string;
}

// ════════════════════════════════════════════════════════════════════════════
// ENTERTAINMENT MODULE — Interfaces
// ════════════════════════════════════════════════════════════════════════════

/**
 * A media content category card in the entertainment system.
 */
export interface IMediaCategory {
    id: string;
    title: string;       // e.g. "Latest Blockbusters"
    description: string;
    imagePath: string;
    type: 'movies' | 'tv' | 'music' | 'games' | 'podcasts' | 'books';
    itemCount: number;       // e.g. 1200 titles
    isNew: boolean;
}

/**
 * A Wi-Fi connectivity plan / speed tier.
 */
export interface IConnectivityPlan {
    id: string;
    name: string;        // e.g. "Surf", "Stream", "Unlimited"
    speed: string;        // e.g. "Up to 25 Mbps"
    description: string;
    priceFrom: string;        // e.g. "From USD 4.99" or "Complimentary"
    isFree: boolean;
    features: string[];
    badge?: 'recommended' | 'popular' | 'best-value';
}









// ── Hub Sections Data ─────────────────────────────────────────────────────────
export const JOURNEY_HUB_SECTIONS: IJourneyHubSection[] = [
    {
        id: 'cabins',
        title: 'Your Private Sanctuary',
        tagline: 'Cabins',
        description: 'Step into a world where the sky becomes your personal suite. From our legendary Suites to thoughtfully designed Economy cabins, every seat is a statement.',
        imagePath: 'assets/images/journey-with-us/hub-cabins.png',
        route: '/journey-with-us/cabins',
        accentColor: '#B68F24'
    },
    {
        id: 'dining',
        title: 'Cuisine at Altitude',
        tagline: 'Dining',
        description: 'Award-winning menus curated by a panel of renowned chefs. Reserve your preferred meal up to six weeks before departure.',
        imagePath: 'assets/images/journey-with-us/hub-dining.png',
        route: '/journey-with-us/dining',
        accentColor: '#B68F24'
    },
    {
        id: 'entertainment',
        title: 'A World of Discovery',
        tagline: 'Entertainment',
        description: 'Thousands of movies, TV shows, music tracks, and games — all curated for the discerning traveller. Your preferences, remembered.',
        imagePath: 'assets/images/journey-with-us/hub-entertainment.png',
        route: '/journey-with-us/entertainment',
        accentColor: '#B68F24'
    },
    {
        id: 'before-the-flight',
        title: 'The Journey Begins',
        tagline: 'Before the Flight',
        description: 'From our exclusive lounges to seamless check-in experiences, every detail is considered long before you board.',
        imagePath: 'assets/images/journey-with-us/hub-before-flight.png',
        route: '/journey-with-us/before-the-flight',
        accentColor: '#B68F24'
    },
    {
        id: 'our-story',
        title: 'A Legacy of Excellence',
        tagline: 'Our Story',
        description: 'Decades of refined craft, countless awards, and an unwavering commitment to every passenger — discover what defines Asiaporeair.',
        imagePath: 'assets/images/journey-with-us/hub-our-story.png',
        route: '/journey-with-us/our-story',
        accentColor: '#B68F24'
    }
];

// ── Cabin Cards Data ──────────────────────────────────────────────────────────
export const CABIN_FEATURE_CARDS: ICabinFeatureCard[] = [
    {
        id: 'suites',
        title: 'Suites',
        tagline: 'The Pinnacle of Private Air Travel',
        badge: 'Exclusive',
        description: 'A private sanctuary at 35,000 feet. Full-grain leather seating, floor-to-ceiling sliding doors, and a double bed crafted for two.',
        imagePath: 'assets/images/journey-with-us/cabin-suites.png',
        route: '/journey-with-us/cabins/suites',
        specs: [
            { label: 'Seat Width', value: '35 inches' },
            { label: 'Bed Length', value: '82 inches' },
            { label: 'Screen', value: '32″ HD' },
            { label: 'Aircraft', value: 'A380' }
        ]
    },
    {
        id: 'first-class',
        title: 'First Class',
        tagline: 'Refined Elegance in Every Detail',
        badge: 'Flagship',
        description: 'Expansive, fully flat beds with direct aisle access. Handcrafted interiors paired with world-class dining served at your pace.',
        imagePath: 'assets/images/journey-with-us/cabin-first-class.png',
        route: '/journey-with-us/cabins/first-class',
        specs: [
            { label: 'Seat Width', value: '30 inches' },
            { label: 'Bed Length', value: '78 inches' },
            { label: 'Screen', value: '23.5″ HD' },
            { label: 'Aircraft', value: 'A380 / B777' }
        ]
    },
    {
        id: 'business-class',
        title: 'Business Class',
        tagline: 'Productivity Meets Indulgence',
        description: 'Direct aisle access from every seat, lie-flat beds, and a curated menu that transforms travel into an occasion.',
        imagePath: 'assets/images/journey-with-us/cabin-business.png',
        route: '/journey-with-us/cabins/business-class',
        specs: [
            { label: 'Seat Width', value: '28 inches' },
            { label: 'Bed Length', value: '76 inches' },
            { label: 'Screen', value: '18.5″ HD' },
            { label: 'Aircraft', value: 'Multiple' }
        ]
    },
    {
        id: 'premium-economy',
        title: 'Premium Economy',
        tagline: 'More Space, More Comfort',
        description: 'Thoughtfully designed with extra legroom, dedicated service, and a premium dining experience set apart from the rest of the cabin.',
        imagePath: 'assets/images/journey-with-us/cabin-premium-economy.png',
        route: '/journey-with-us/cabins/premium-economy',
        specs: [
            { label: 'Seat Width', value: '19.5 inches' },
            { label: 'Legroom', value: '38 inches' },
            { label: 'Screen', value: '13.3″ HD' },
            { label: 'Aircraft', value: 'Multiple' }
        ]
    },
    {
        id: 'economy',
        title: 'Economy Class',
        tagline: 'Comfort for Every Journey',
        description: 'Ergonomically optimised seats, award-winning inflight entertainment, and warm hospitality — regardless of which cabin you choose.',
        imagePath: 'assets/images/journey-with-us/cabin-economy.png',
        route: '/journey-with-us/cabins/economy',
        specs: [
            { label: 'Seat Width', value: '18 inches' },
            { label: 'Legroom', value: '32 inches' },
            { label: 'Screen', value: '11.1″ HD' },
            { label: 'Aircraft', value: 'Multiple' }
        ]
    }
];

// ── Cabin Detail Data ─────────────────────────────────────────────────────────
export const CABIN_DETAILS: Record<string, ICabinDetail> = {
    'suites': {
        key: 'suites',
        title: 'Suites',
        subtitle: 'Your private retreat above the clouds',
        aircraft: 'Airbus A380',
        heroImage: 'assets/images/journey-with-us/detail-suites-hero.png',
        galleryImages: [
            'assets/images/journey-with-us/suites-gallery-1.png',
            'assets/images/journey-with-us/suites-gallery-2.png',
            'assets/images/journey-with-us/suites-gallery-3.png',
            'assets/images/journey-with-us/suites-gallery-4.png'
        ],
        virtualTourLabel: 'Explore the Suite',
        amenities: [
            {
                id: 'seat',
                icon: 'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z',
                title: 'A Seat That Revolves Around You',
                body: 'Full-grain leather by a renowned Italian house. Fully reclinable and rotating, your seat adapts to every moment — from take-off to touchdown.',
                highlight: '35" wide'
            },
            {
                id: 'bed',
                icon: 'M2 9h20v6H2z',
                title: 'Double Suite Experience',
                body: 'Travelling together? In adjoining Suites, the centre partition lowers to create a luxurious double bed. Your world just became limitless.',
                highlight: '82" long'
            },
            {
                id: 'privacy',
                icon: 'M18 8h-1V6a5 5 0 0 0-10 0v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2z',
                title: 'Your Private Space, On Demand',
                body: 'A sliding lacquered door shields you from the world. Electronically controlled window blinds add a final layer of absolute privacy.',
                highlight: 'Sliding door'
            },
            {
                id: 'screen',
                icon: 'M21 3H3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z',
                title: 'A Private Screening',
                body: 'A 32" HD touchscreen paired with audiophile-grade noise-cancelling headphones. Your curated entertainment, delivered at cinema quality.',
                highlight: '32" HD'
            },
            {
                id: 'dining',
                icon: 'M3 11l19-9-9 19-2-8-8-2z',
                title: 'Dine on Your Terms',
                body: 'Bone china tableware set upon crisp linen. Choose from our signature inflight menu or pre-order your preferred course up to six weeks before departure.',
                highlight: 'Book the Cook'
            },
            {
                id: 'lavatory',
                icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
                title: 'A Sanctuary to Refresh',
                body: 'Spacious lavatories with a sit-down vanity counter, complete with an exquisite toiletry range. Step off feeling as polished as when you boarded.',
                highlight: 'Private lavatory'
            }
        ]
    },
    'first-class': {
        key: 'first-class',
        title: 'First Class',
        subtitle: 'Flagship elegance, every flight',
        aircraft: 'Airbus A380 / Boeing 777',
        heroImage: 'assets/images/journey-with-us/detail-first-class-hero.png',
        galleryImages: [
            'assets/images/journey-with-us/first-class-gallery-1.png',
            'assets/images/journey-with-us/first-class-gallery-2.png',
            'assets/images/journey-with-us/first-class-gallery-3.png'
        ],
        virtualTourLabel: 'Tour First Class',
        amenities: [
            {
                id: 'seat',
                icon: 'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z',
                title: 'Fully Flat. Fully Yours.',
                body: 'A 30-inch-wide seat that transforms into a fully-flat bed. Designed for long-haul restorative sleep, finished with a mattress topper and premier bedding.',
                highlight: '78" flat bed'
            },
            {
                id: 'screen',
                icon: 'M21 3H3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z',
                title: 'Cinematic Entertainment',
                body: 'A 23.5" HD touchscreen with thousands of on-demand titles. Curated by our entertainment team to include cinema releases before they go to streaming.',
                highlight: '23.5" HD'
            },
            {
                id: 'dining',
                icon: 'M3 11l19-9-9 19-2-8-8-2z',
                title: 'Chef-Curated Dining',
                body: 'Menus created in collaboration with our International Culinary Panel — a collection of the world\'s most celebrated chefs. Dine when you wish, with what you wish.',
                highlight: 'Dine anytime'
            },
            {
                id: 'amenities',
                icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
                title: 'Curated Amenity Kit',
                body: 'A premium amenity kit containing a fine selection of skincare and comfort essentials. Everything you need to arrive refreshed and ready.',
                highlight: 'Premium kit'
            }
        ]
    },
    'business-class': {
        key: 'business-class',
        title: 'Business Class',
        subtitle: 'Where ambition meets comfort',
        aircraft: 'Multiple Aircraft',
        heroImage: 'assets/images/journey-with-us/detail-business-hero.png',
        galleryImages: [
            'assets/images/journey-with-us/business-gallery-1.png',
            'assets/images/journey-with-us/business-gallery-2.png',
            'assets/images/journey-with-us/business-gallery-3.png'
        ],
        virtualTourLabel: 'Explore Business Class',
        amenities: [
            {
                id: 'seat',
                icon: 'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z',
                title: 'Direct Aisle Access, Always',
                body: 'A staggered 1-2-1 configuration ensures every passenger has direct aisle access. No climbing over your neighbour — ever.',
                highlight: 'Aisle access'
            },
            {
                id: 'workspace',
                icon: 'M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z',
                title: 'Your Boardroom Above the Clouds',
                body: 'A dedicated work surface with AC and USB power, plus high-speed Wi-Fi available on most routes. Productivity, elevated.',
                highlight: 'Full workspace'
            },
            {
                id: 'bed',
                icon: 'M2 9h20v6H2z',
                title: 'Flat Bed Comfort',
                body: 'When work gives way to rest, your seat transforms into a fully flat bed. Drift off with noise-cancelling headphones and plush bedding.',
                highlight: '76" flat bed'
            }
        ]
    },
    'premium-economy': {
        key: 'premium-economy',
        title: 'Premium Economy',
        subtitle: 'Elevated comfort, personal space',
        aircraft: 'Multiple Aircraft',
        heroImage: 'assets/images/journey-with-us/detail-premium-economy-hero.png',
        galleryImages: [
            'assets/images/journey-with-us/premium-economy-gallery-1.png',
            'assets/images/journey-with-us/premium-economy-gallery-2.png'
        ],
        virtualTourLabel: 'See Premium Economy',
        amenities: [
            {
                id: 'space',
                icon: 'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z',
                title: 'Noticeably More Space',
                body: 'Wider seats with generous legroom in a dedicated cabin. A footrest and adjustable headrest complete a thoughtfully designed personal space.',
                highlight: '38" legroom'
            },
            {
                id: 'dining',
                icon: 'M3 11l19-9-9 19-2-8-8-2z',
                title: 'A Step Above',
                body: 'A distinct dining experience with premium tableware, dedicated menus, and attentive service in a quieter, more intimate cabin environment.',
                highlight: 'Premium dining'
            }
        ]
    },
    'economy': {
        key: 'economy',
        title: 'Economy Class',
        subtitle: 'Exceptional comfort from the very first seat',
        aircraft: 'Multiple Aircraft',
        heroImage: 'assets/images/journey-with-us/detail-economy-hero.png',
        galleryImages: [
            'assets/images/journey-with-us/economy-gallery-1.png',
            'assets/images/journey-with-us/economy-gallery-2.png'
        ],
        virtualTourLabel: 'Explore Economy',
        amenities: [
            {
                id: 'comfort',
                icon: 'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z',
                title: 'Ergonomic Comfort',
                body: 'Ergonomically sculpted seats with adjustable headrests, individual air nozzles, and thoughtful storage ensure comfort throughout your journey.',
                highlight: '32" legroom'
            },
            {
                id: 'entertainment',
                icon: 'M21 3H3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z',
                title: 'World-Class Entertainment',
                body: 'Access over 1,000 on-demand entertainment options on an 11.1" HD screen. Your journey, soundtracked and screened to perfection.',
                highlight: '11.1" HD'
            },
            {
                id: 'meals',
                icon: 'M3 11l19-9-9 19-2-8-8-2z',
                title: 'Thoughtful Dining',
                body: 'Hot, freshly prepared meals with a range of options, including vegetarian and special dietary requests. Good food should not be a privilege.',
                highlight: 'Hot meals'
            }
        ]
    }
};




// ════════════════════════════════════════════════════════════════════════════
// DINING DATA CONSTANTS
// ════════════════════════════════════════════════════════════════════════════

export const CHEF_PROFILES: IChefProfile[] = [
    {
        id: 'chef-01',
        name: 'Marco Aurelio Ferretti',
        title: 'Michelin-Starred Chef, Ristorante Aurum, Milan',
        nationality: 'Italian',
        imagePath: 'assets/images/journey-with-us/chef-ferretti.png',
        quote: 'Every plate is a conversation between the finest ingredients and the traveller\'s palate. At altitude, flavour must speak louder.',
        signatureDish: 'Slow-braised Wagyu with truffle jus and aged parmigiano foam',
        awards: ['2 Michelin Stars', 'World\'s 50 Best — #18']
    },
    {
        id: 'chef-02',
        name: 'Hiroshi Yamamoto',
        title: 'Executive Chef, Kaiseki Yuki, Kyoto',
        nationality: 'Japanese',
        imagePath: 'assets/images/journey-with-us/chef-yamamoto.png',
        quote: 'Japanese kaiseki is about honouring each season. We bring that same reverence to every meal served above the clouds.',
        signatureDish: 'Sakura-smoked sea bass with dashi broth and yuzu kosho',
        awards: ['3 Michelin Stars', 'James Beard Foundation Award']
    },
    {
        id: 'chef-03',
        name: 'Okonkwo',
        title: 'Head Chef, The Table, Cape Town',
        nationality: 'Nigerian-South African',
        imagePath: 'assets/images/journey-with-us/chef-okonkwo.png',
        quote: 'African cuisine is one of the world\'s great untold stories. We bring that story to every route we fly through the continent.',
        signatureDish: 'Spiced lamb shoulder with piri piri glaze and roasted saffron couscous',
        awards: ['1 Michelin Star', 'Africa\'s 50 Best — #4']
    },
    {
        id: 'chef-04',
        name: 'Peng Wei',
        title: 'Founding Chef, Jade Pavilion, Singapore',
        nationality: 'Singaporean',
        imagePath: 'assets/images/journey-with-us/chef-peng.png',
        quote: 'Singapore\'s culinary identity is a beautiful collision of cultures. I distil that into every dish that takes flight.',
        signatureDish: 'Teochew-style steamed garoupa with aged soy, ginger oil and chrysanthemum',
        awards: ['2 Michelin Stars', 'Asia\'s 50 Best — #7']
    }
];

export const DISH_ITEMS: IDishItem[] = [
    {
        id: 'dish-01',
        name: 'Wagyu Tenderloin with Morel Jus',
        description: 'Grain-fed Wagyu tenderloin, roasted to medium-rare with a silken morel mushroom reduction, truffle pomme purée, and wilted seasonal greens.',
        imagePath: 'assets/images/journey-with-us/dish-wagyu.png',
        cabinClass: 'suites',
        course: 'main',
        chefId: 'chef-01',
        highlight: 'Chef\'s Signature'
    },
    {
        id: 'dish-02',
        name: 'Sakura-Smoked Sea Bass',
        description: 'Line-caught sea bass gently smoked over sakura wood chips, finished with a warm dashi broth, yuzu kosho, and a garnish of micro shiso.',
        imagePath: 'assets/images/journey-with-us/dish-seabass.png',
        cabinClass: 'first',
        course: 'main',
        chefId: 'chef-02',
        dietary: ['gluten-free'],
        highlight: 'Seasonal Special'
    },
    {
        id: 'dish-03',
        name: 'Chilled Lobster Bisque',
        description: 'A velvety bisque of sustainable Scottish lobster, served chilled with a dollop of crème fraîche, Oscietra caviar, and fresh tarragon oil.',
        imagePath: 'assets/images/journey-with-us/dish-lobster.png',
        cabinClass: 'suites',
        course: 'starter',
        highlight: 'Suites Exclusive'
    },
    {
        id: 'dish-04',
        name: 'Spiced Lamb with Piri Piri Glaze',
        description: 'Slow-roasted Moroccan lamb shoulder with a house piri piri glaze, served on a bed of saffron couscous with preserved lemon gremolata.',
        imagePath: 'assets/images/journey-with-us/dish-lamb.png',
        cabinClass: 'business',
        course: 'main',
        chefId: 'chef-03',
        dietary: ['halal']
    },
    {
        id: 'dish-05',
        name: 'Valrhona Chocolate Soufflé',
        description: 'A warm Valrhona dark chocolate soufflé, risen to perfection, accompanied by a Grand Marnier crème anglaise and vanilla bean ice cream.',
        imagePath: 'assets/images/journey-with-us/dish-souffle.png',
        cabinClass: 'first',
        course: 'dessert',
        highlight: 'Pastry Chef\'s Creation'
    },
    {
        id: 'dish-06',
        name: 'Steamed Garoupa in Teochew Style',
        description: 'Wild-caught garoupa steamed to flawless tenderness, finished with a cascade of sizzling aged soy, ginger oil, and fresh chrysanthemum petals.',
        imagePath: 'assets/images/journey-with-us/dish-garoupa.png',
        cabinClass: 'suites',
        course: 'main',
        chefId: 'chef-04',
        dietary: ['gluten-free']
    }
];

export const INFLIGHT_MENU_GROUPS: IInflightMenuGroup[] = [
    {
        id: 'menu-suites',
        cabinClass: 'Suites',
        imagePath: 'assets/images/journey-with-us/menu-suites.png',
        menuLabel: 'Suites & First Class',
        description: 'Dine at any hour. Book the Cook up to 6 weeks before departure and pre-select from our signature menus.',
        route: '/journey-with-us/dining/inflight-menus'
    },
    {
        id: 'menu-business',
        cabinClass: 'Business Class',
        imagePath: 'assets/images/journey-with-us/menu-business.png',
        menuLabel: 'Business Class',
        description: 'Chef-curated multi-course menus inspired by global destinations, served at your convenience.',
        route: '/journey-with-us/dining/inflight-menus'
    },
    {
        id: 'menu-economy',
        cabinClass: 'Economy',
        imagePath: 'assets/images/journey-with-us/menu-economy.png',
        menuLabel: 'Premium Economy & Economy',
        description: 'Freshly prepared meals with genuine warmth of service — good dining should be accessible at every seat.',
        route: '/journey-with-us/dining/inflight-menus'
    }
];

export const SPECIAL_MEAL_TYPES: ISpecialMealType[] = [
    { id: 'vgml', code: 'VGML', name: 'Vegan Meal', description: 'Fully plant-based, no animal products of any kind.', icon: 'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z' },
    { id: 'hnml', code: 'HNML', name: 'Hindu Meal', description: 'Vegetarian meal prepared to Hindu dietary practices.', icon: 'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z' },
    { id: 'moml', code: 'MOML', name: 'Muslim Meal', description: 'Halal-certified meat and ingredients throughout.', icon: 'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z' },
    { id: 'gfml', code: 'GFML', name: 'Gluten-Free Meal', description: 'Prepared without gluten-containing ingredients.', icon: 'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z' },
    { id: 'dbml', code: 'DBML', name: 'Diabetic Meal', description: 'Low sugar, low fat, high fibre formulation.', icon: 'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z' },
    { id: 'lcml', code: 'LCML', name: 'Low Calorie Meal', description: 'Balanced nutrition with reduced caloric content.', icon: 'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z' }
];

// ════════════════════════════════════════════════════════════════════════════
// BEFORE THE FLIGHT DATA CONSTANTS
// ════════════════════════════════════════════════════════════════════════════

export const LOUNGE_FACILITIES: ILoungeFacility[] = [
    {
        id: 'shower',
        iconPath: 'M12 2v2m0 16v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M2 12h2m16 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42',
        title: 'Private Shower Suites',
        description: 'Premium rain-head showers stocked with luxury amenity products.'
    },
    {
        id: 'wifi',
        iconPath: 'M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01',
        title: 'High-Speed Wi-Fi',
        description: 'Complimentary fibre-grade connectivity throughout the lounge.'
    },
    {
        id: 'dining',
        iconPath: 'M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zM6 1v3M10 1v3M14 1v3',
        title: 'À La Carte Dining',
        description: 'Restaurant-style service from an evolving menu of global cuisine.'
    },
    {
        id: 'spa',
        iconPath: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z',
        title: 'Wellness & Spa',
        description: 'Pre-flight massages and relaxation treatments by appointment.'
    },
    {
        id: 'bar',
        iconPath: 'M8 22V12H4l8-10 8 10h-4v10',
        title: 'Premium Bar',
        description: 'A curated selection of Champagne, single malts, and signature cocktails.'
    },
    {
        id: 'sleep',
        iconPath: 'M2 9h20v6H2zM7 9V4a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v5',
        title: 'Rest Pods',
        description: 'Private reclining pods for undisturbed rest before departure.'
    }
];

export const LOUNGE_ACCESS_TIERS: ILoungeAccessTier[] = [
    {
        cabinOrTier: 'Suites',
        lounge: 'The Private Room',
        benefits: ['Exclusive butler-style service', 'Private dining room access', 'Chef\'s table experience', 'Pre-flight bed turndown'],
        badge: 'gold'
    },
    {
        cabinOrTier: 'First Class',
        lounge: 'First Class Lounge',
        benefits: ['À la carte dining', 'Private shower suites', 'Dedicated check-in counter', 'Premium bar access'],
        badge: 'gold'
    },
    {
        cabinOrTier: 'Business Class',
        lounge: 'SilverKris Business Lounge',
        benefits: ['Buffet dining', 'Shower facilities', 'High-speed Wi-Fi', 'Quiet work zones'],
        badge: 'silver'
    },
    {
        cabinOrTier: 'Voyager Gold & Above',
        lounge: 'SilverKris Business Lounge',
        benefits: ['Frequent flyer lounge access', 'Buffet dining', 'Wi-Fi access', 'Guest privileges'],
        badge: 'silver'
    },
    {
        cabinOrTier: 'Voyager Elite',
        lounge: 'SilverKris Lounge',
        benefits: ['Standard lounge access', 'Light refreshments', 'Wi-Fi access'],
        badge: 'standard'
    }
];

export const AIRPORT_FEATURES: IAirportFeature[] = [
    {
        id: 'check-in',
        title: 'Exclusive Check-In Zones',
        description: 'Dedicated premium check-in counters ensure a seamless, unhurried start to your journey — no queues, no compromise.',
        imagePath: 'assets/images/journey-with-us/airport-checkin.png',
        icon: 'M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11'
    },
    {
        id: 'transfer',
        title: 'Seamless Transfers',
        description: 'Our dedicated transfer team ensures connection flights are handled with care. Your journey continues without interruption.',
        imagePath: 'assets/images/journey-with-us/airport-transfer.png',
        icon: 'M5 12h14M12 5l7 7-7 7'
    },
    {
        id: 'assistance',
        title: 'Priority Assistance',
        description: 'From check-in to the gate, our ground concierge is available for Suites and First Class travellers throughout the terminal.',
        imagePath: 'assets/images/journey-with-us/airport-assistance.png',
        icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M12 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z'
    }
];

export const SHOPPING_ITEMS: IShoppingItem[] = [
    {
        id: 'shop-01',
        name: 'No. 5 Eau de Parfum',
        brand: 'Chanel',
        category: 'fragrance',
        imagePath: 'assets/images/journey-with-us/shop-fragrance.png',
        tagline: 'The icon, reimagined for every altitude.',
        exclusive: false
    },
    {
        id: 'shop-02',
        name: 'Altitude Ritual Skincare Set',
        brand: 'Asiaporeair Exclusive',
        category: 'skincare',
        imagePath: 'assets/images/journey-with-us/shop-skincare.png',
        tagline: 'Formulated for cabin air. Crafted for first impressions.',
        exclusive: true
    },
    {
        id: 'shop-03',
        name: 'Luxury soft drinks and juices',
        brand: 'Asiaporeair Exclusive',
        category: 'spirits',
        imagePath: 'assets/images/journey-with-us/shop-whisky.png',
        tagline: 'A rare expression, available only at altitude.',
        exclusive: true
    },
    {
        id: 'shop-04',
        name: 'Silk Inflight Scarf',
        brand: 'Hermès',
        category: 'fashion',
        imagePath: 'assets/images/journey-with-us/shop-scarf.png',
        tagline: 'Printed for Asiaporeair. A collector\'s edition.',
        exclusive: true
    }
];




// ════════════════════════════════════════════════════════════════════════════
// OUR STORY DATA CONSTANTS
// ════════════════════════════════════════════════════════════════════════════

export const TIMELINE_EVENTS: ITimelineEvent[] = [
    {
        id: 'te-01', year: 1972,
        title: 'A New Horizon Takes Flight',
        description: 'Asiaporeair is founded as an independent national carrier, operating its inaugural service between Singapore and the Asia-Pacific region with a modest fleet of five aircraft.',
        imagePath: 'assets/images/journey-with-us/heritage-1972.png',
        badge: 'Foundation',
        isHighlight: true
    },
    {
        id: 'te-02', year: 1978,
        title: 'Crossing the Pacific',
        description: 'The airline launches its first transpacific route, connecting Southeast Asia to the West Coast of the United States — a milestone that establishes Asiaporeair on the global stage.',
        imagePath: 'assets/images/journey-with-us/heritage-1978.png',
        badge: 'New Route',
        isHighlight: false
    },
    {
        id: 'te-03', year: 1984,
        title: 'The First Class Suite Vision',
        description: 'Asiaporeair introduces an entirely reconfigured First Class cabin concept — a visionary product that redefines in-flight luxury and earns widespread industry recognition.',
        imagePath: 'assets/images/journey-with-us/heritage-1984.png',
        badge: 'Innovation',
        isHighlight: true
    },
    {
        id: 'te-04', year: 1991,
        title: 'Voted World\'s Best Airline',
        description: 'Asiaporeair receives its first major international airline ranking award, acknowledging its exceptional service standards across all cabin classes.',
        imagePath: 'assets/images/journey-with-us/heritage-1991.png',
        badge: 'Award',
        isHighlight: false
    },
    {
        id: 'te-05', year: 1998,
        title: 'The Concierge Revolution',
        description: 'A comprehensive service overhaul introduces dedicated concierge programmes, personalised dining pre-ordering, and a loyalty tier system that sets the benchmark for the industry.',
        imagePath: 'assets/images/journey-with-us/heritage-1998.png',
        badge: 'Service',
        isHighlight: false
    },
    {
        id: 'te-06', year: 2007,
        title: 'The A380 Takes Flight',
        description: 'Asiaporeair becomes one of the world\'s first carriers to operate the Airbus A380 Superjumbo, introducing the iconic private Suites product — a fully enclosed cabin with a sliding door and double bed.',
        imagePath: 'assets/images/journey-with-us/heritage-2007.png',
        badge: 'Fleet Milestone',
        isHighlight: true
    },
    {
        id: 'te-07', year: 2014,
        title: 'A New Generation of Suites',
        description: 'An entirely reimagined Suites cabin launches on the A380, featuring full-grain leather by a celebrated Italian craftsman, marble-effect surfaces, and an updated double bed configuration.',
        imagePath: 'assets/images/journey-with-us/heritage-2014.png',
        badge: 'Product Launch',
        isHighlight: false
    },
    {
        id: 'te-08', year: 2019,
        title: 'Ultra Long Haul Pioneers',
        description: 'Asiaporeair inaugurates one of the world\'s longest non-stop commercial routes, demonstrating operational excellence and expanding possibilities for global connectivity.',
        imagePath: 'assets/images/journey-with-us/heritage-2019.png',
        badge: 'Record Route',
        isHighlight: true
    },
    {
        id: 'te-09', year: 2024,
        title: 'A Sustainable Future',
        description: 'Committing to net-zero carbon emissions by 2050, Asiaporeair invests in sustainable aviation fuel partnerships and introduces the next generation of fuel-efficient widebody aircraft to its fleet.',
        imagePath: 'assets/images/journey-with-us/heritage-2024.png',
        badge: 'Sustainability',
        isHighlight: false
    }
];

export const VINTAGE_PHOTOS: IVintagePhoto[] = [
    {
        id: 'vp-01',
        imagePath: 'assets/images/journey-with-us/vintage-1972-cabin.png',
        caption: 'The original cabin — 1972',
        year: 1972,
        altText: 'Original Asiaporeair cabin interior from 1972'
    },
    {
        id: 'vp-02',
        imagePath: 'assets/images/journey-with-us/vintage-1980-lounge.png',
        caption: 'First Class lounge — 1980',
        year: 1980,
        altText: 'First Class lounge aboard Asiaporeair, circa 1980'
    },
    {
        id: 'vp-03',
        imagePath: 'assets/images/journey-with-us/vintage-1990-crew.png',
        caption: 'Cabin crew, inaugural Pacific route — 1990',
        year: 1990,
        altText: 'Cabin crew portrait from the inaugural Pacific route, 1990'
    },
    {
        id: 'vp-04',
        imagePath: 'assets/images/journey-with-us/vintage-2000-fleet.png',
        caption: 'Fleet expansion — early 2000s',
        year: 2001,
        altText: 'Asiaporeair fleet at hub airport, early 2000s'
    }
];

export const AWARD_ITEMS: IAwardItem[] = [
    {
        id: 'aw-01',
        title: 'World\'s Best Airline',
        organisation: 'Skyline Airline Excellence Awards',
        year: 2024,
        category: 'Overall',
        consecutive: 12,
        iconType: 'trophy',
        isGrand: true
    },
    {
        id: 'aw-02',
        title: 'Best Cabin Staff in the World',
        organisation: 'Skyline Airline Excellence Awards',
        year: 2024,
        category: 'Cabin Staff',
        consecutive: 8,
        iconType: 'star',
        isGrand: true
    },
    {
        id: 'aw-03',
        title: 'Best First Class',
        organisation: 'Skyline Airline Excellence Awards',
        year: 2024,
        category: 'First Class Product',
        iconType: 'ribbon',
        isGrand: false
    },
    {
        id: 'aw-04',
        title: 'Best Business Class',
        organisation: 'Global Air Travel Awards',
        year: 2024,
        category: 'Business Class',
        iconType: 'ribbon',
        isGrand: false
    },
    {
        id: 'aw-05',
        title: 'Best Airline in Asia',
        organisation: 'Travel & Leisure Excellence Awards',
        year: 2024,
        category: 'Regional',
        consecutive: 5,
        iconType: 'globe',
        isGrand: false
    },
    {
        id: 'aw-06',
        title: 'Best Inflight Entertainment',
        organisation: 'Passenger Experience Innovation Awards',
        year: 2024,
        category: 'Entertainment',
        iconType: 'star',
        isGrand: false
    },
    {
        id: 'aw-07',
        title: 'Most Sustainable Airline',
        organisation: 'Global Aviation Sustainability Forum',
        year: 2024,
        category: 'Sustainability',
        iconType: 'globe',
        isGrand: false
    },
    {
        id: 'aw-08',
        title: 'Best Economy Class',
        organisation: 'Skyline Airline Excellence Awards',
        year: 2024,
        category: 'Economy Class',
        iconType: 'star',
        isGrand: false
    }
];

export const FLEET_DATA: IFleetData[] = [
    {
        id: 'fl-01',
        model: 'Airbus A380-800',
        nickname: 'The Superjumbo',
        imagePath: 'assets/images/journey-with-us/fleet-a380.png',
        range: '15,200 km',
        maxPassengers: 471,
        cabins: ['Suites', 'First Class', 'Business Class', 'Economy'],
        entered: 2007,
        highlight: 'Home to the iconic fully enclosed Suites and a dedicated lounge bar — the ultimate expression of private air travel.',
        badge: 'Flagship'
    },
    {
        id: 'fl-02',
        model: 'Boeing 777-300ER',
        nickname: 'The Workhorse of Luxury',
        imagePath: 'assets/images/journey-with-us/fleet-777.png',
        range: '13,650 km',
        maxPassengers: 360,
        cabins: ['First Class', 'Business Class', 'Economy'],
        entered: 2006,
        highlight: 'A globally trusted widebody that delivers First Class and Business Class excellence on high-demand trunk routes worldwide.',
        badge: 'Flagship'
    },
    {
        id: 'fl-03',
        model: 'Airbus A350-900',
        nickname: 'The Future of Long-Haul',
        imagePath: 'assets/images/journey-with-us/fleet-a350.png',
        range: '15,000 km',
        maxPassengers: 253,
        cabins: ['Business Class', 'Premium Economy', 'Economy'],
        entered: 2016,
        highlight: 'Built from advanced composite materials, offering a quieter, more fuel-efficient long-haul experience with higher cabin humidity and pressure.',
    },
    {
        id: 'fl-04',
        model: 'Airbus A350-900ULR',
        nickname: 'The Ultra Long Range Pioneer',
        imagePath: 'assets/images/journey-with-us/fleet-a350ulr.png',
        range: '18,000 km',
        maxPassengers: 161,
        cabins: ['Business Class', 'Premium Economy'],
        entered: 2018,
        highlight: 'Specially configured for the world\'s longest non-stop commercial routes with additional fuel capacity and premium-focused cabin layout.',
        badge: 'Ultra Long Range'
    },
    {
        id: 'fl-05',
        model: 'Boeing 787-10 Dreamliner',
        nickname: 'The Regional Flagship',
        imagePath: 'assets/images/journey-with-us/fleet-787.png',
        range: '11,910 km',
        maxPassengers: 317,
        cabins: ['Business Class', 'Economy'],
        entered: 2018,
        highlight: 'Composite airframe technology delivers exceptional fuel efficiency and a superior passenger experience on medium and long-haul routes.'
    }
];

export const CREW_SPOTLIGHTS: ICrewSpotlight[] = [
    {
        id: 'cs-01',
        name: 'Ling Sam',
        role: 'Chief Flight Stewardess',
        yearsOfService: 18,
        imagePath: 'assets/images/journey-with-us/crew-ling.png',
        quote: 'Every passenger carries a story. Our role is not simply to serve — it is to make that story more beautiful.',
        baseCity: 'Singapore'
    },
    {
        id: 'cs-02',
        name: 'Arjun ',
        role: 'Senior Flight Steward',
        yearsOfService: 11,
        imagePath: 'assets/images/journey-with-us/crew-arjun.png',
        quote: 'The uniform carries a promise. From the moment I put it on, I am committed to delivering an experience that exceeds every expectation.',
        baseCity: 'Mumbai'
    },
    {
        id: 'cs-03',
        name: 'Jone',
        role: 'Flight Stewardess',
        yearsOfService: 6,
        imagePath: 'assets/images/journey-with-us/crew-jone.png',
        quote: 'I have watched the sun rise over three oceans this month alone. This career is a privilege I do not take lightly.',
        baseCity: 'Athens'
    }
];


// ════════════════════════════════════════════════════════════════════════════
// ENTERTAINMENT DATA CONSTANTS
// ════════════════════════════════════════════════════════════════════════════

export const MEDIA_CATEGORIES: IMediaCategory[] = [
    {
        id: 'mc-01',
        title: 'Latest Blockbusters',
        description: 'The newest cinema releases from Hollywood and around the world — available before they hit home streaming.',
        imagePath: 'assets/images/journey-with-us/entertainment-movies.png',
        type: 'movies',
        itemCount: 1200,
        isNew: true
    },
    {
        id: 'mc-02',
        title: 'Premium TV Series',
        description: 'Binge complete series from award-winning studios — no interruptions, no waiting, no buffering.',
        imagePath: 'assets/images/journey-with-us/entertainment-tv.png',
        type: 'tv',
        itemCount: 680,
        isNew: false
    },
    {
        id: 'mc-03',
        title: 'Music & Playlists',
        description: 'Over 5,000 albums across every genre. Curated playlists that sync with your sleep rhythm and time zone shift.',
        imagePath: 'assets/images/journey-with-us/entertainment-music.png',
        type: 'music',
        itemCount: 5000,
        isNew: false
    },
    {
        id: 'mc-04',
        title: 'Games & Interactives',
        description: 'Family favourites and strategy titles for every age. Multiplayer options available on select routes.',
        imagePath: 'assets/images/journey-with-us/entertainment-games.png',
        type: 'games',
        itemCount: 150,
        isNew: false
    },
    {
        id: 'mc-05',
        title: 'Podcasts & Audio',
        description: 'Curated long-form audio from world-class storytellers, journalists, and thought leaders.',
        imagePath: 'assets/images/journey-with-us/entertainment-podcasts.png',
        type: 'podcasts',
        itemCount: 320,
        isNew: true
    },
    {
        id: 'mc-06',
        title: 'Digital Reading',
        description: 'Access hundreds of digital newspapers, magazines, and books — including day-of-departure editions.',
        imagePath: 'assets/images/journey-with-us/entertainment-books.png',
        type: 'books',
        itemCount: 480,
        isNew: false
    }
];

export const CONNECTIVITY_PLANS: IConnectivityPlan[] = [
    {
        id: 'cp-01',
        name: 'Basic Surf',
        speed: 'Up to 5 Mbps',
        description: 'Light browsing, email, and social media to keep you connected throughout your flight.',
        priceFrom: 'From USD 4.99',
        isFree: false,
        features: ['Messaging apps', 'Email & browsing', 'Social media feeds'],
        badge: undefined
    },
    {
        id: 'cp-02',
        name: 'Premium Stream',
        speed: 'Up to 25 Mbps',
        description: 'High-speed connectivity for video calls, HD streaming, and heavy data use during your journey.',
        priceFrom: 'From USD 14.99',
        isFree: false,
        features: ['Video conferencing', 'HD streaming', 'Cloud file access', 'VPN compatible'],
        badge: 'recommended'
    },
    {
        id: 'cp-03',
        name: 'Suites Unlimited',
        speed: 'Up to 50 Mbps',
        description: 'Complimentary unlimited high-speed Wi-Fi, exclusively available to Suites and First Class passengers.',
        priceFrom: 'Complimentary',
        isFree: true,
        features: ['Unlimited data', '4K streaming capable', 'Priority bandwidth', 'Multi-device connection'],
        badge: 'best-value'
    }
];