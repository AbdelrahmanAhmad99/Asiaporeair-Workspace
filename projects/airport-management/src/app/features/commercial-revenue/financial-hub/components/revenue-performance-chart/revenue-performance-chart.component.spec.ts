import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RevenuePerformanceChartComponent } from './revenue-performance-chart.component';

describe('RevenuePerformanceChartComponent', () => {
  let component: RevenuePerformanceChartComponent;
  let fixture: ComponentFixture<RevenuePerformanceChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RevenuePerformanceChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RevenuePerformanceChartComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
