import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlightStatusCardComponent } from './flight-status-card.component';

describe('FlightStatusCardComponent', () => {
  let component: FlightStatusCardComponent;
  let fixture: ComponentFixture<FlightStatusCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlightStatusCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlightStatusCardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
