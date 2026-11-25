import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromoCodeBannerComponent } from './promo-code-banner.component';

describe('PromoCodeBannerComponent', () => {
  let component: PromoCodeBannerComponent;
  let fixture: ComponentFixture<PromoCodeBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PromoCodeBannerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PromoCodeBannerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
