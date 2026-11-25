import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PassengerTicketHistoryListComponent } from './passenger-ticket-history-list.component';

describe('PassengerTicketHistoryListComponent', () => {
  let component: PassengerTicketHistoryListComponent;
  let fixture: ComponentFixture<PassengerTicketHistoryListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PassengerTicketHistoryListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PassengerTicketHistoryListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
