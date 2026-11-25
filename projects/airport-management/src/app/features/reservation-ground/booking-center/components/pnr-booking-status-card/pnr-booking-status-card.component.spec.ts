import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PnrBookingStatusCardComponent } from './pnr-booking-status-card.component';

describe('PnrBookingStatusCardComponent', () => {
  let component: PnrBookingStatusCardComponent;
  let fixture: ComponentFixture<PnrBookingStatusCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PnrBookingStatusCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PnrBookingStatusCardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
