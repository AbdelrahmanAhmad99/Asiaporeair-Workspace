// Re-exports IDestinationCard (used by existing destination-explorer) and adds
// home-specific domain interfaces for Offers, News, Alerts, and Experience Features.

import { UserRole } from '../../../core/auth/roles.model';

// ── IDestinationCard ─────────────────────────────────────────────────────────
// Matches exactly what destination-explorer.component.ts expects.
export interface IDestinationCard {
  id: string;
  iata: string;
  city: string;
  country: string;
  originIata: string;
  tagline: string;
  imageUrl?: string;
  imageGradient: string;
  offerLabel: string;
  currency: string;
  fromPrice: number;
}

// ── ISearchEnginePatch ───────────────────────────────────────────────────────
// Passed to FlightSearchEngineComponent.applyPatch() when a destination is selected.
export interface ISearchEnginePatch {
  originIata?: string;
  originDisplay?: string;
  destinationIata?: string;
  destinationDisplay?: string;
  cabinClass?: string;
}

// ── IOfferCard ───────────────────────────────────────────────────────────────
export interface IOfferCard {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  badge?: string;
  validUntil?: string;
  ctaLabel: string;
  ctaRoute: string;
}

// ── IExperienceFeature ───────────────────────────────────────────────────────
export interface IExperienceFeature {
  id: string;
  eyebrow: string;
  headline: string;
  body: string;
  imageUrl: string;
  ctaLabel: string;
  ctaRoute: string;
  imageLeft: boolean;  // alternating layout
}

// ── IServiceIcon ─────────────────────────────────────────────────────────────
export interface IServiceIcon {
  id: string;
  svgPath: string;        // raw SVG <path d="..."> for ultra-thin line art
  label: string;
  sublabel?: string;
}

// ── INewsCard ────────────────────────────────────────────────────────────────
export interface INewsCard {
  id: string;
  category: string;
  headline: string;
  excerpt: string;
  imageUrl: string;
  publishedAt: string;   // ISO date string
  ctaRoute: string;
}

// ── IAdvisoryAlert ───────────────────────────────────────────────────────────
export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface IAdvisoryAlert {
  id: string;
  severity: AlertSeverity;
  message: string;
  ctaLabel?: string;
  ctaRoute?: string;
  dismissible: boolean;
}