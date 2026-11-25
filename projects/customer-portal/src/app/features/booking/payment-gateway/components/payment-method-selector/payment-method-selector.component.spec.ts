import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentMethodSelectorComponent } from './payment-method-selector.component';

describe('PaymentMethodSelectorComponent', () => {
  let component: PaymentMethodSelectorComponent;
  let fixture: ComponentFixture<PaymentMethodSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentMethodSelectorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentMethodSelectorComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
