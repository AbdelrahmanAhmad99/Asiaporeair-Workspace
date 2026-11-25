
import {
  Component, ChangeDetectionStrategy, signal, inject, PLATFORM_ID
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hero-visual-background',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './hero-visual-background.component.html',
  styleUrl: './hero-visual-background.component.scss',
})
export class HeroVisualBackgroundComponent {
  private readonly platformId = inject(PLATFORM_ID);

  readonly isBrowser = isPlatformBrowser(this.platformId);
  readonly videoFailed = signal(false);

  readonly videoSrc = 'assets/images/home/hero-cinematic.mp4';
  readonly posterSrc = 'assets/images/home/hero-poster.png';
} 