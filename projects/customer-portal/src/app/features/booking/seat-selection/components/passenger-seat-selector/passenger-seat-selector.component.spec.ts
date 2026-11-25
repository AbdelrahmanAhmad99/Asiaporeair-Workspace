import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PassengerSeatSelectorComponent } from './passenger-seat-selector.component';

describe('PassengerSeatSelectorComponent', () => {
  let component: PassengerSeatSelectorComponent;
  let fixture: ComponentFixture<PassengerSeatSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PassengerSeatSelectorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PassengerSeatSelectorComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
