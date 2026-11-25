import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffingReportTableComponent } from './staffing-report-table.component';

describe('StaffingReportTableComponent', () => {
  let component: StaffingReportTableComponent;
  let fixture: ComponentFixture<StaffingReportTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StaffingReportTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StaffingReportTableComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
