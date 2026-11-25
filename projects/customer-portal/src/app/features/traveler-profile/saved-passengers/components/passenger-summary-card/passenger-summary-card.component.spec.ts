import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PassengerSummaryCardComponent } from './passenger-summary-card.component';

describe('PassengerSummaryCardComponent', () => {
  let component: PassengerSummaryCardComponent;
  let fixture: ComponentFixture<PassengerSummaryCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PassengerSummaryCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PassengerSummaryCardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
