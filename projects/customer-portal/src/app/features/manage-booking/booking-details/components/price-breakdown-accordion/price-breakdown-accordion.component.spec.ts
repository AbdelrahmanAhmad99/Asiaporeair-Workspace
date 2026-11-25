import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriceBreakdownAccordionComponent } from './price-breakdown-accordion.component';

describe('PriceBreakdownAccordionComponent', () => {
  let component: PriceBreakdownAccordionComponent;
  let fixture: ComponentFixture<PriceBreakdownAccordionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PriceBreakdownAccordionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PriceBreakdownAccordionComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
