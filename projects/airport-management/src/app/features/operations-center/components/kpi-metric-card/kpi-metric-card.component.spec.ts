import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KpiMetricCardComponent } from './kpi-metric-card.component';

describe('KpiMetricCardComponent', () => {
  let component: KpiMetricCardComponent;
  let fixture: ComponentFixture<KpiMetricCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KpiMetricCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KpiMetricCardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
