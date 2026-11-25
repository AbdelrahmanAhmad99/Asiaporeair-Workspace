import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentDataGridComponent } from './payment-data-grid.component';

describe('PaymentDataGridComponent', () => {
  let component: PaymentDataGridComponent;
  let fixture: ComponentFixture<PaymentDataGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentDataGridComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentDataGridComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
