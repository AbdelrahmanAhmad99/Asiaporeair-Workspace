import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlightRosterPlannerComponent } from './flight-roster-planner.component';

describe('FlightRosterPlannerComponent', () => {
  let component: FlightRosterPlannerComponent;
  let fixture: ComponentFixture<FlightRosterPlannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlightRosterPlannerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlightRosterPlannerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
