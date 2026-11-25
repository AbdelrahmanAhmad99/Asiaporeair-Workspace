import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AncillaryPricingReviewComponent } from './ancillary-pricing-review.component';

describe('AncillaryPricingReviewComponent', () => {
  let component: AncillaryPricingReviewComponent;
  let fixture: ComponentFixture<AncillaryPricingReviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AncillaryPricingReviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AncillaryPricingReviewComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
