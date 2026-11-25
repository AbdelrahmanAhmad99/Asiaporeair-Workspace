import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LegTimelineVisualizerComponent } from './leg-timeline-visualizer.component';

describe('LegTimelineVisualizerComponent', () => {
  let component: LegTimelineVisualizerComponent;
  let fixture: ComponentFixture<LegTimelineVisualizerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LegTimelineVisualizerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LegTimelineVisualizerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
