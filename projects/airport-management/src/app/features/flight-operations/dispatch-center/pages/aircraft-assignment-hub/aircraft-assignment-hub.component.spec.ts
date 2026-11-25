import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AircraftAssignmentHubComponent } from './aircraft-assignment-hub.component';

describe('AircraftAssignmentHubComponent', () => {
  let component: AircraftAssignmentHubComponent;
  let fixture: ComponentFixture<AircraftAssignmentHubComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AircraftAssignmentHubComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AircraftAssignmentHubComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
