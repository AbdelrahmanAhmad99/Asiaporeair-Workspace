import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlightStatusComponent } from './flight-status.component';

describe('FlightStatusComponent', () => {
  let component: FlightStatusComponent;
  let fixture: ComponentFixture<FlightStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlightStatusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlightStatusComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
