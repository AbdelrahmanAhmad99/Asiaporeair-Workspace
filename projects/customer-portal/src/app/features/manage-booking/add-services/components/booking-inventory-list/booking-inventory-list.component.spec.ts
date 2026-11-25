import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingInventoryListComponent } from './booking-inventory-list.component';

describe('BookingInventoryListComponent', () => {
  let component: BookingInventoryListComponent;
  let fixture: ComponentFixture<BookingInventoryListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingInventoryListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookingInventoryListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
