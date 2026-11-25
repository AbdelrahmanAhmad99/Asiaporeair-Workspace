import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlightSelectionBarComponent } from './flight-selection-bar.component';

describe('FlightSelectionBarComponent', () => {
  let component: FlightSelectionBarComponent;
  let fixture: ComponentFixture<FlightSelectionBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlightSelectionBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlightSelectionBarComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
