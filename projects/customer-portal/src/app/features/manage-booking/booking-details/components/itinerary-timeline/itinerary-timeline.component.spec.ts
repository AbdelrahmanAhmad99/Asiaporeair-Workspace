import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItineraryTimelineComponent } from './itinerary-timeline.component';

describe('ItineraryTimelineComponent', () => {
  let component: ItineraryTimelineComponent;
  let fixture: ComponentFixture<ItineraryTimelineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItineraryTimelineComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ItineraryTimelineComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
