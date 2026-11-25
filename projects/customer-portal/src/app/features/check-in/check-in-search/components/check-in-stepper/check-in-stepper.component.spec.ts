import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckInStepperComponent } from './check-in-stepper.component';

describe('CheckInStepperComponent', () => {
  let component: CheckInStepperComponent;
  let fixture: ComponentFixture<CheckInStepperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckInStepperComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CheckInStepperComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
