import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeroVideoBannerComponent } from './hero-video-banner.component';

describe('HeroVideoBannerComponent', () => {
  let component: HeroVideoBannerComponent;
  let fixture: ComponentFixture<HeroVideoBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroVideoBannerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeroVideoBannerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
