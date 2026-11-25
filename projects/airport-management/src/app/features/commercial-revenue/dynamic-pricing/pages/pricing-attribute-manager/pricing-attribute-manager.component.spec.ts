import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PricingAttributeManagerComponent } from './pricing-attribute-manager.component';

describe('PricingAttributeManagerComponent', () => {
  let component: PricingAttributeManagerComponent;
  let fixture: ComponentFixture<PricingAttributeManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PricingAttributeManagerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PricingAttributeManagerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
