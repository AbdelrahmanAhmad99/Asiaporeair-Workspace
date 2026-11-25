import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItinerarySummaryRowComponent } from './itinerary-summary-row.component';

describe('ItinerarySummaryRowComponent', () => {
  let component: ItinerarySummaryRowComponent;
  let fixture: ComponentFixture<ItinerarySummaryRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItinerarySummaryRowComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ItinerarySummaryRowComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
