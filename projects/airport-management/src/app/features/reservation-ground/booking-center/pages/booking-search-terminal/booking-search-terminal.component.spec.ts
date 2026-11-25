import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingSearchTerminalComponent } from './booking-search-terminal.component';

describe('BookingSearchTerminalComponent', () => {
  let component: BookingSearchTerminalComponent;
  let fixture: ComponentFixture<BookingSearchTerminalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingSearchTerminalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookingSearchTerminalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
