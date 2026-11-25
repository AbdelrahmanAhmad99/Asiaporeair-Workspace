import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RevenueSummaryWidgetComponent } from './revenue-summary-widget.component';

describe('RevenueSummaryWidgetComponent', () => {
  let component: RevenueSummaryWidgetComponent;
  let fixture: ComponentFixture<RevenueSummaryWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RevenueSummaryWidgetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RevenueSummaryWidgetComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
