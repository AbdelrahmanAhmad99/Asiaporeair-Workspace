import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PassengerTicketCardComponent } from './passenger-ticket-card.component';

describe('PassengerTicketCardComponent', () => {
  let component: PassengerTicketCardComponent;
  let fixture: ComponentFixture<PassengerTicketCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PassengerTicketCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PassengerTicketCardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
