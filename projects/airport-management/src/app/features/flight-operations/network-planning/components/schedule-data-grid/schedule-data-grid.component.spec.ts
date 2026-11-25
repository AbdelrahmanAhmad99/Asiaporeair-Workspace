import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleDataGridComponent } from './schedule-data-grid.component';

describe('ScheduleDataGridComponent', () => {
  let component: ScheduleDataGridComponent;
  let fixture: ComponentFixture<ScheduleDataGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScheduleDataGridComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScheduleDataGridComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
