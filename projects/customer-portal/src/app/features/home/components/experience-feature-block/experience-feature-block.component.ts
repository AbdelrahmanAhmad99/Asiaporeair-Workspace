import {
  Component, Input, ChangeDetectionStrategy,
  ElementRef, AfterViewInit, inject, PLATFORM_ID, ChangeDetectorRef
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IExperienceFeature } from '../../store/flights.store';

@Component({
  selector: 'app-experience-feature-block',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule],
  templateUrl: './experience-feature-block.component.html',
  styleUrl: './experience-feature-block.component.scss',
})
export class ExperienceFeatureBlockComponent implements AfterViewInit {

  @Input({ required: true }) feature!: IExperienceFeature;
 
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly cdr = inject(ChangeDetectorRef);

  isVisible = false;

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.isVisible = true;
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          this.isVisible = true;
          this.cdr.markForCheck();
          observer.disconnect();
        }
      },
      { threshold: 0.05, rootMargin: '0px 0px -100px 0px' }
    );

    observer.observe(this.el.nativeElement);
  }
}