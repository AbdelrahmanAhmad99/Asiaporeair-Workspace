import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PricingTimelineChartComponent } from './pricing-timeline-chart.component';

describe('PricingTimelineChartComponent', () => {
  let component: PricingTimelineChartComponent;
  let fixture: ComponentFixture<PricingTimelineChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PricingTimelineChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PricingTimelineChartComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
