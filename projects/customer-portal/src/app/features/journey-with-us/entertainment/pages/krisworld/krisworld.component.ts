// ============================================================================
// krisworld.component.ts
// Asiaporeair | Smart Page — SkyWorld Inflight Entertainment
// ============================================================================

import {
  Component, ChangeDetectionStrategy, signal, computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MediaCategoryCardComponent } from '../../components/media-category-card/media-category-card.component';
import {
  MEDIA_CATEGORIES, IMediaCategory
} from '../../../models/journey-with-us.models';

type MediaFilter = 'all' | 'movies' | 'tv' | 'music' | 'games' | 'podcasts' | 'books';

@Component({
  selector: 'app-krisworld',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, MediaCategoryCardComponent],
  templateUrl: './krisworld.component.html',
  styleUrl: './krisworld.component.scss'
})
export class KrisworldComponent {

  readonly allCategories = signal<IMediaCategory[]>(MEDIA_CATEGORIES);
  readonly activeFilter = signal<MediaFilter>('all');

  readonly filters: { label: string; value: MediaFilter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Movies', value: 'movies' },
    { label: 'TV', value: 'tv' },
    { label: 'Music', value: 'music' },
    { label: 'Games', value: 'games' },
    { label: 'Podcasts', value: 'podcasts' },
    { label: 'Reading', value: 'books' }
  ];

  readonly filteredCategories = computed(() => {
    const f = this.activeFilter();
    return f === 'all'
      ? this.allCategories()
      : this.allCategories().filter(c => c.type === f);
  });

  readonly cabinScreens = [
    { cabin: 'Suites', size: '32"' },
    { cabin: 'First Class', size: '23.5"' },
    { cabin: 'Business Class', size: '18.5"' },
    { cabin: 'Premium Economy', size: '13.3"' },
    { cabin: 'Economy', size: '11.1"' }
  ];

  setFilter(value: MediaFilter): void { this.activeFilter.set(value); }
}