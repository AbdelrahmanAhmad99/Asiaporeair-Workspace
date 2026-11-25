import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AircraftProfileHubComponent } from './aircraft-profile-hub.component';

describe('AircraftProfileHubComponent', () => {
  let component: AircraftProfileHubComponent;
  let fixture: ComponentFixture<AircraftProfileHubComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AircraftProfileHubComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AircraftProfileHubComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
