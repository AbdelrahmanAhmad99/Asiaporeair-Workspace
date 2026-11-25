// ============================================================================
// flight-promo-banners.component.ts
// Asiaporeair | Luxury Promotional Banner Carousel — Dumb Component
// ============================================================================

import {
  Component, Input, Output, EventEmitter,
  ChangeDetectionStrategy, signal, computed, OnInit, OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IPromoBanner } from '../../../store/flights.store';

@Component({
  selector: 'app-flight-promo-banners',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './flight-promo-banners.component.html',
  styleUrls: ['./flight-promo-banners.component.scss']
})
export class FlightPromoBannersComponent implements OnInit, OnDestroy {
  @Input() banners: IPromoBanner[] = [];
  @Input() autoPlayIntervalMs: number = 5500;

  @Output() bannerCtaClicked = new EventEmitter<IPromoBanner>();

  // ── Carousel state ────────────────────────────────────────────────────────
  readonly activeIndex = signal<number>(0);
  readonly isTransitioning = signal<boolean>(false);

  readonly activeBanner = computed(() =>
    this.banners[this.activeIndex()] ?? null
  );

  private autoPlayTimer: ReturnType<typeof setInterval> | null = null;

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    if (this.banners.length > 1) {
      this.startAutoPlay();
    }
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
  }

  // ── Carousel controls ─────────────────────────────────────────────────────

  goTo(index: number): void {
    if (index === this.activeIndex()) return;
    this.isTransitioning.set(true);
    this.activeIndex.set(index);
    setTimeout(() => this.isTransitioning.set(false), 400);
  }

  prev(): void {
    const next = (this.activeIndex() - 1 + this.banners.length) % this.banners.length;
    this.goTo(next);
    this.restartAutoPlay();
  }

  next(): void {
    const next = (this.activeIndex() + 1) % this.banners.length;
    this.goTo(next);
    this.restartAutoPlay();
  }

  onDotClick(index: number): void {
    this.goTo(index);
    this.restartAutoPlay();
  }

  private startAutoPlay(): void {
    this.autoPlayTimer = setInterval(() => {
      this.next();
    }, this.autoPlayIntervalMs);
  }

  private stopAutoPlay(): void {
    if (this.autoPlayTimer) {
      clearInterval(this.autoPlayTimer);
      this.autoPlayTimer = null;
    }
  }

  private restartAutoPlay(): void {
    this.stopAutoPlay();
    this.startAutoPlay();
  }
}