import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinancialHealthMeterComponent } from './financial-health-meter.component';

describe('FinancialHealthMeterComponent', () => {
  let component: FinancialHealthMeterComponent;
  let fixture: ComponentFixture<FinancialHealthMeterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinancialHealthMeterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FinancialHealthMeterComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
