import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RangeCalculatorInputComponent } from './range-calculator-input.component';

describe('RangeCalculatorInputComponent', () => {
  let component: RangeCalculatorInputComponent;
  let fixture: ComponentFixture<RangeCalculatorInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RangeCalculatorInputComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RangeCalculatorInputComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
