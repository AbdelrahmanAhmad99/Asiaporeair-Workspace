import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnboardingStepIndicatorComponent } from './onboarding-step-indicator.component';

describe('OnboardingStepIndicatorComponent', () => {
  let component: OnboardingStepIndicatorComponent;
  let fixture: ComponentFixture<OnboardingStepIndicatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnboardingStepIndicatorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnboardingStepIndicatorComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
