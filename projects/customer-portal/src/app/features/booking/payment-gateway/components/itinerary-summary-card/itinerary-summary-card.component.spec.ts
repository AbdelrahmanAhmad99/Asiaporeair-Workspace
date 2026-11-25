import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItinerarySummaryCardComponent } from './itinerary-summary-card.component';

describe('ItinerarySummaryCardComponent', () => {
  let component: ItinerarySummaryCardComponent;
  let fixture: ComponentFixture<ItinerarySummaryCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItinerarySummaryCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ItinerarySummaryCardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
