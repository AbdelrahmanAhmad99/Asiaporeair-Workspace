import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentStatusBadgeComponent } from './payment-status-badge.component';

describe('PaymentStatusBadgeComponent', () => {
  let component: PaymentStatusBadgeComponent;
  let fixture: ComponentFixture<PaymentStatusBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentStatusBadgeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentStatusBadgeComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
