import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleFilterPanelComponent } from './schedule-filter-panel.component';

describe('ScheduleFilterPanelComponent', () => {
  let component: ScheduleFilterPanelComponent;
  let fixture: ComponentFixture<ScheduleFilterPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScheduleFilterPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScheduleFilterPanelComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
