import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecruitmentTrendsReportComponent } from './recruitment-trends-report.component';

describe('RecruitmentTrendsReportComponent', () => {
  let component: RecruitmentTrendsReportComponent;
  let fixture: ComponentFixture<RecruitmentTrendsReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecruitmentTrendsReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecruitmentTrendsReportComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
