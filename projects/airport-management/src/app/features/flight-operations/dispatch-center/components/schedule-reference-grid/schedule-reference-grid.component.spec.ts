import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleReferenceGridComponent } from './schedule-reference-grid.component';

describe('ScheduleReferenceGridComponent', () => {
  let component: ScheduleReferenceGridComponent;
  let fixture: ComponentFixture<ScheduleReferenceGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScheduleReferenceGridComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScheduleReferenceGridComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
