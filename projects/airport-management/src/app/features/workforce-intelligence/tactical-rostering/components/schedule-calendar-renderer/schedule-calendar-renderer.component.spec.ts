import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleCalendarRendererComponent } from './schedule-calendar-renderer.component';

describe('ScheduleCalendarRendererComponent', () => {
  let component: ScheduleCalendarRendererComponent;
  let fixture: ComponentFixture<ScheduleCalendarRendererComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScheduleCalendarRendererComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScheduleCalendarRendererComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
