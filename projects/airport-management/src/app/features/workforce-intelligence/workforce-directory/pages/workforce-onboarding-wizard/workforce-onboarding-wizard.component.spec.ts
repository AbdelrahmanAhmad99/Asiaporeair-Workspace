import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkforceOnboardingWizardComponent } from './workforce-onboarding-wizard.component';

describe('WorkforceOnboardingWizardComponent', () => {
  let component: WorkforceOnboardingWizardComponent;
  let fixture: ComponentFixture<WorkforceOnboardingWizardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkforceOnboardingWizardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkforceOnboardingWizardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
