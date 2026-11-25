import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OriginalPaymentSummaryCardComponent } from './original-payment-summary-card.component';

describe('OriginalPaymentSummaryCardComponent', () => {
  let component: OriginalPaymentSummaryCardComponent;
  let fixture: ComponentFixture<OriginalPaymentSummaryCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OriginalPaymentSummaryCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OriginalPaymentSummaryCardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
