import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlightCrewRosterListComponent } from './flight-crew-roster-list.component';

describe('FlightCrewRosterListComponent', () => {
  let component: FlightCrewRosterListComponent;
  let fixture: ComponentFixture<FlightCrewRosterListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlightCrewRosterListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlightCrewRosterListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
