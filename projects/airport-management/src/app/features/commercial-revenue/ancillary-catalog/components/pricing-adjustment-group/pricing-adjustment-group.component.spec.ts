import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PricingAdjustmentGroupComponent } from './pricing-adjustment-group.component';

describe('PricingAdjustmentGroupComponent', () => {
  let component: PricingAdjustmentGroupComponent;
  let fixture: ComponentFixture<PricingAdjustmentGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PricingAdjustmentGroupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PricingAdjustmentGroupComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
