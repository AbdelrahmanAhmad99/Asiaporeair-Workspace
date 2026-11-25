import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AircraftRegistrationWizardComponent } from './aircraft-registration-wizard.component';

describe('AircraftRegistrationWizardComponent', () => {
  let component: AircraftRegistrationWizardComponent;
  let fixture: ComponentFixture<AircraftRegistrationWizardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AircraftRegistrationWizardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AircraftRegistrationWizardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
