import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalyticsSummaryWidgetsComponent } from './analytics-summary-widgets.component';

describe('AnalyticsSummaryWidgetsComponent', () => {
  let component: AnalyticsSummaryWidgetsComponent;
  let fixture: ComponentFixture<AnalyticsSummaryWidgetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalyticsSummaryWidgetsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnalyticsSummaryWidgetsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
