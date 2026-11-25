import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlightHoursLoggerComponent } from './flight-hours-logger.component';

describe('FlightHoursLoggerComponent', () => {
  let component: FlightHoursLoggerComponent;
  let fixture: ComponentFixture<FlightHoursLoggerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlightHoursLoggerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlightHoursLoggerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
