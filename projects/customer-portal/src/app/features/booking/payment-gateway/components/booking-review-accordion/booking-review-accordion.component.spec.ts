import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingReviewAccordionComponent } from './booking-review-accordion.component';

describe('BookingReviewAccordionComponent', () => {
  let component: BookingReviewAccordionComponent;
  let fixture: ComponentFixture<BookingReviewAccordionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingReviewAccordionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookingReviewAccordionComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
