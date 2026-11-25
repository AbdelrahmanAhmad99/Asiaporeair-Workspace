import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlightProgressTimelineComponent } from './flight-progress-timeline.component';

describe('FlightProgressTimelineComponent', () => {
  let component: FlightProgressTimelineComponent;
  let fixture: ComponentFixture<FlightProgressTimelineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlightProgressTimelineComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlightProgressTimelineComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
