import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentFilterBarComponent } from './payment-filter-bar.component';

describe('PaymentFilterBarComponent', () => {
  let component: PaymentFilterBarComponent;
  let fixture: ComponentFixture<PaymentFilterBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentFilterBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentFilterBarComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
