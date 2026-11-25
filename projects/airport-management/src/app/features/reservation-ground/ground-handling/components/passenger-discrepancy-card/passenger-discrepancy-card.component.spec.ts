import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PassengerDiscrepancyCardComponent } from './passenger-discrepancy-card.component';

describe('PassengerDiscrepancyCardComponent', () => {
  let component: PassengerDiscrepancyCardComponent;
  let fixture: ComponentFixture<PassengerDiscrepancyCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PassengerDiscrepancyCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PassengerDiscrepancyCardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
