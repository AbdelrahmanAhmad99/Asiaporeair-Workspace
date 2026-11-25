import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PassengerCheckInCardComponent } from './passenger-check-in-card.component';

describe('PassengerCheckInCardComponent', () => {
  let component: PassengerCheckInCardComponent;
  let fixture: ComponentFixture<PassengerCheckInCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PassengerCheckInCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PassengerCheckInCardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
