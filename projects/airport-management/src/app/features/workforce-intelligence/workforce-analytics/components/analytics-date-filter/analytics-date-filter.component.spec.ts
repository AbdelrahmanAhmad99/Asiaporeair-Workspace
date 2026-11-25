import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalyticsDateFilterComponent } from './analytics-date-filter.component';

describe('AnalyticsDateFilterComponent', () => {
  let component: AnalyticsDateFilterComponent;
  let fixture: ComponentFixture<AnalyticsDateFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalyticsDateFilterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnalyticsDateFilterComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
