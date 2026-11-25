import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentReceiptSummaryComponent } from './payment-receipt-summary.component';

describe('PaymentReceiptSummaryComponent', () => {
  let component: PaymentReceiptSummaryComponent;
  let fixture: ComponentFixture<PaymentReceiptSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentReceiptSummaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentReceiptSummaryComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
