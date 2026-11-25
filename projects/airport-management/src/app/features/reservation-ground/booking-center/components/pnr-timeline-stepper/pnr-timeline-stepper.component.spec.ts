import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PnrTimelineStepperComponent } from './pnr-timeline-stepper.component';

describe('PnrTimelineStepperComponent', () => {
  let component: PnrTimelineStepperComponent;
  let fixture: ComponentFixture<PnrTimelineStepperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PnrTimelineStepperComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PnrTimelineStepperComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
