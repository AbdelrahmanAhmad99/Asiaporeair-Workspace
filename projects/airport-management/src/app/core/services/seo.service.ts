// =============================================================================
// seo.service.ts
// Asiaporeair | Core / Services — Per-Route SEO & Meta Tag Manager
// =============================================================================

import { Injectable, inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

export interface SeoConfig {
  title: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
}

const BRAND_SUFFIX = 'Asiaporeair';

/**
 * Programmatically updates the document `<title>` and `<meta>` tags on every
 * route transition. Essential for SEO and social sharing in an Angular SSR app.
 *
 * Call `updateSeo()` from each page component's `ngOnInit`, or wire it into
 * a route resolver.
 *
 * @example
 * ```ts
 * this.seo.updateSeo({
 *   title:       'Begin Your Journey',
 *   description: 'Search and book premium flights with Asiaporeair.',
 *   ogImage:     'https://cdn.asiaporeair.com/og/home.png',
 * });
 * ```
 */
@Injectable({ providedIn: 'root' })
export class SeoService {

  private readonly titleService = inject(Title);
  private readonly metaService = inject(Meta);

  /**
   * Applies the full set of meta tags for a given route.
   * @param config SEO configuration object.
   */
  updateSeo(config: SeoConfig): void {
    this.setTitle(config.title);
    this.setDescription(config.description);
    this.setKeywords(config.keywords);
    this.setOpenGraph(config);
    this.setRobots(config.noIndex);
    if (config.canonicalUrl) this.setCanonical(config.canonicalUrl);
  }

  // ── Title ──────────────────────────────────────────────────────────────────

  setTitle(pageTitle: string): void {
    this.titleService.setTitle(`${pageTitle} | ${BRAND_SUFFIX}`);
  }

  // ── Meta tags ──────────────────────────────────────────────────────────────

  private setDescription(description?: string): void {
    if (!description) return;
    this.metaService.updateTag({ name: 'description', content: description });
  }

  private setKeywords(keywords?: string): void {
    if (!keywords) return;
    this.metaService.updateTag({ name: 'keywords', content: keywords });
  }

  private setOpenGraph(config: SeoConfig): void {
    const title = `${config.title} | ${BRAND_SUFFIX}`;
    const description = config.description ?? '';
    const type = config.ogType ?? 'website';

    this.metaService.updateTag({ property: 'og:title', content: title });
    this.metaService.updateTag({ property: 'og:description', content: description });
    this.metaService.updateTag({ property: 'og:type', content: type });

    if (config.ogImage) {
      this.metaService.updateTag({ property: 'og:image', content: config.ogImage });
    }

    if (config.canonicalUrl) {
      this.metaService.updateTag({ property: 'og:url', content: config.canonicalUrl });
    }

    // Twitter card
    this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.metaService.updateTag({ name: 'twitter:title', content: title });
    this.metaService.updateTag({ name: 'twitter:description', content: description });
  }

  private setRobots(noIndex?: boolean): void {
    const content = noIndex ? 'noindex, nofollow' : 'index, follow';
    this.metaService.updateTag({ name: 'robots', content });
  }

  private setCanonical(url: string): void {
    // Update or create the canonical link tag
    let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }
}