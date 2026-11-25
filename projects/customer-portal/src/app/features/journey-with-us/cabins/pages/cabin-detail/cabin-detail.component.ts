// ============================================================================
// cabin-detail.component.ts
// Asiaporeair | Smart Page — Cabin Detail (shared by all 5 cabin routes)
// ============================================================================

import {
  Component, OnInit, ChangeDetectionStrategy,
  inject, signal, computed, OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  trigger, transition, style, animate, query, stagger
} from '@angular/animations';

import {
  CABIN_DETAILS, ICabinDetail, ICabinFeatureCard,
  CABIN_FEATURE_CARDS
} from '../../../models/journey-with-us.models';
import { HeroVideoBannerComponent } from '../../../journey/components/hero-video-banner/hero-video-banner.component';
import { ImageGallerySliderComponent } from '../../components/image-gallery-slider/image-gallery-slider.component';
import { AmenityGridItemComponent } from '../../components/amenity-grid-item/amenity-grid-item.component';
import { VirtualTourButtonComponent } from '../../components/virtual-tour-button/virtual-tour-button.component';

const PAGE_ANIMATIONS = [
  trigger('fadeUp', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateY(20px)' }),
      animate('520ms cubic-bezier(0.22, 1, 0.36, 1)',
        style({ opacity: 1, transform: 'translateY(0)' }))
    ])
  ])
];

@Component({
  selector: 'app-cabin-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    HeroVideoBannerComponent,
    ImageGallerySliderComponent,
    AmenityGridItemComponent,
    VirtualTourButtonComponent
  ],
  animations: PAGE_ANIMATIONS,
  templateUrl: './cabin-detail.component.html',
  styleUrls: ['./cabin-detail.component.scss']
})
export class CabinDetailComponent implements OnInit, OnDestroy {

  private route = inject(ActivatedRoute);
  private router = inject(Router);

  readonly cabinDetail = signal<ICabinDetail | null>(null);
  readonly isLoading = signal<boolean>(true);
  readonly showTourInfo = signal<boolean>(false);

  // Related cabins (excluding current)
  readonly relatedCabins = computed((): ICabinFeatureCard[] => {
    const key = this.cabinDetail()?.key;
    return CABIN_FEATURE_CARDS.filter(c => c.id !== key).slice(0, 2);
  });

  readonly breadcrumbs = computed(() => {
    const detail = this.cabinDetail();
    return [
      { label: 'Home', route: '/' },
      { label: 'Journey With Us', route: '/journey-with-us/landing' },
      { label: 'Cabins', route: '/journey-with-us/cabins' },
      { label: detail?.title ?? '' }
    ];
  });

  private routeSub?: Subscription;

  ngOnInit(): void {
    this.routeSub = this.route.data.subscribe(data => {
      const key = data['cabinKey'] as string;
      const detail = CABIN_DETAILS[key] ?? null;
      this.cabinDetail.set(detail);
      this.isLoading.set(false);
      if (!detail) {
        this.router.navigate(['/journey-with-us/cabins']);
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  onVirtualTour(): void {
    this.showTourInfo.update(v => !v);
  }

  trackById(_: number, item: { id: string }): string { return item.id; }
}