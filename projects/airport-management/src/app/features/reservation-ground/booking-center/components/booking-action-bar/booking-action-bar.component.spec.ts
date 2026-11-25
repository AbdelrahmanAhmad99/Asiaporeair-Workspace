import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingActionBarComponent } from './booking-action-bar.component';

describe('BookingActionBarComponent', () => {
  let component: BookingActionBarComponent;
  let fixture: ComponentFixture<BookingActionBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingActionBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookingActionBarComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
