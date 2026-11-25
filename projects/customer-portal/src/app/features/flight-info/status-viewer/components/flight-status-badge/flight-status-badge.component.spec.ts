import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlightStatusBadgeComponent } from './flight-status-badge.component';

describe('FlightStatusBadgeComponent', () => {
  let component: FlightStatusBadgeComponent;
  let fixture: ComponentFixture<FlightStatusBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlightStatusBadgeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlightStatusBadgeComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
