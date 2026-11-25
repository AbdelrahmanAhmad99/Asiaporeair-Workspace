import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkforceRatioChartComponent } from './workforce-ratio-chart.component';

describe('WorkforceRatioChartComponent', () => {
  let component: WorkforceRatioChartComponent;
  let fixture: ComponentFixture<WorkforceRatioChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkforceRatioChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkforceRatioChartComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
