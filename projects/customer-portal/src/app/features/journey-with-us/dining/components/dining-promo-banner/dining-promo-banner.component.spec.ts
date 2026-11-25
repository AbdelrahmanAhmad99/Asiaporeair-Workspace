import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiningPromoBannerComponent } from './dining-promo-banner.component';

describe('DiningPromoBannerComponent', () => {
  let component: DiningPromoBannerComponent;
  let fixture: ComponentFixture<DiningPromoBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiningPromoBannerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiningPromoBannerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
