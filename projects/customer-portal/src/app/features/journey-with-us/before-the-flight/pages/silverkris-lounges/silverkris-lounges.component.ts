// ============================================================================
// silverkris-lounges.component.ts
// Asiaporeair | Smart Page — SilverKris Lounges
// ============================================================================

import {
  Component, ChangeDetectionStrategy, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  LOUNGE_FACILITIES, LOUNGE_ACCESS_TIERS,
  ILoungeFacility, ILoungeAccessTier
} from '../../../models/journey-with-us.models';
import { LoungeFacilityIconsComponent } from '../../components/lounge-facility-icons/lounge-facility-icons.component';
import { AccessCriteriaTableComponent } from '../../components/access-criteria-table/access-criteria-table.component';

@Component({
  selector: 'app-silverkris-lounges',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    LoungeFacilityIconsComponent,
    AccessCriteriaTableComponent
  ],
  templateUrl: './silverkris-lounges.component.html',
  styleUrls: ['./silverkris-lounges.component.scss']
})
export class SilverkrisLoungesComponent {

  readonly breadcrumbs = [
    { label: 'Home', route: '/' },
    { label: 'Journey With Us', route: '/journey-with-us/landing' },
    { label: 'Before the Flight', route: '/journey-with-us/before-the-flight' },
    { label: 'SilverKris Lounges' }
  ];

  readonly facilities = signal<ILoungeFacility[]>(LOUNGE_FACILITIES);
  readonly accessTiers = signal<ILoungeAccessTier[]>(LOUNGE_ACCESS_TIERS);

  readonly loungeGalleryImages = [
    'assets/images/journey-with-us/lounge-private-room.png',
    'assets/images/journey-with-us/lounge-first.png',
    'assets/images/journey-with-us/lounge-business.png',
    'assets/images/journey-with-us/lounge-shower.png'
  ];

  readonly activeGalleryIndex = signal<number>(0);

  setGalleryIndex(index: number): void {
    this.activeGalleryIndex.set(index);
  }

  prevImage(): void {
    this.activeGalleryIndex.update(i =>
      i === 0 ? this.loungeGalleryImages.length - 1 : i - 1
    );
  }

  nextImage(): void {
    this.activeGalleryIndex.update(i =>
      i === this.loungeGalleryImages.length - 1 ? 0 : i + 1
    );
  }
}