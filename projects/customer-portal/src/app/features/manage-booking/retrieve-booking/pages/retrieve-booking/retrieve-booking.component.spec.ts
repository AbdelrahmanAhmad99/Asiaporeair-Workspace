import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetrieveBookingComponent } from './retrieve-booking.component';

describe('RetrieveBookingComponent', () => {
  let component: RetrieveBookingComponent;
  let fixture: ComponentFixture<RetrieveBookingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RetrieveBookingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RetrieveBookingComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
