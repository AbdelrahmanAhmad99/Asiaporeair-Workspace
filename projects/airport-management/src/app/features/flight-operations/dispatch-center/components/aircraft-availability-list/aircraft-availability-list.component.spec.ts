import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AircraftAvailabilityListComponent } from './aircraft-availability-list.component';

describe('AircraftAvailabilityListComponent', () => {
  let component: AircraftAvailabilityListComponent;
  let fixture: ComponentFixture<AircraftAvailabilityListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AircraftAvailabilityListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AircraftAvailabilityListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
