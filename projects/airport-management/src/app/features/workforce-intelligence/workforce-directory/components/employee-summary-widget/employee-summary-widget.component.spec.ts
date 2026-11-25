import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeSummaryWidgetComponent } from './employee-summary-widget.component';

describe('EmployeeSummaryWidgetComponent', () => {
  let component: EmployeeSummaryWidgetComponent;
  let fixture: ComponentFixture<EmployeeSummaryWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeSummaryWidgetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeSummaryWidgetComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
