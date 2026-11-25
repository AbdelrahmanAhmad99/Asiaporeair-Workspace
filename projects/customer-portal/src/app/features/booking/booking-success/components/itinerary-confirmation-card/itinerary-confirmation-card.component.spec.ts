import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItineraryConfirmationCardComponent } from './itinerary-confirmation-card.component';

describe('ItineraryConfirmationCardComponent', () => {
  let component: ItineraryConfirmationCardComponent;
  let fixture: ComponentFixture<ItineraryConfirmationCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItineraryConfirmationCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ItineraryConfirmationCardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
