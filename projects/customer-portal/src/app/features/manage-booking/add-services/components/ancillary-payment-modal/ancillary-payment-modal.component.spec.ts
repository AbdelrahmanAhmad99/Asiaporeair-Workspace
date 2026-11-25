import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AncillaryPaymentModalComponent } from './ancillary-payment-modal.component';

describe('AncillaryPaymentModalComponent', () => {
  let component: AncillaryPaymentModalComponent;
  let fixture: ComponentFixture<AncillaryPaymentModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AncillaryPaymentModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AncillaryPaymentModalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
