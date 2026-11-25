import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalPaymentAuditorComponent } from './global-payment-auditor.component';

describe('GlobalPaymentAuditorComponent', () => {
  let component: GlobalPaymentAuditorComponent;
  let fixture: ComponentFixture<GlobalPaymentAuditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlobalPaymentAuditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GlobalPaymentAuditorComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
