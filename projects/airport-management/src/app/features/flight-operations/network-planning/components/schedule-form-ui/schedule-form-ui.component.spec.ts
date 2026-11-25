import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleFormUiComponent } from './schedule-form-ui.component';

describe('ScheduleFormUiComponent', () => {
  let component: ScheduleFormUiComponent;
  let fixture: ComponentFixture<ScheduleFormUiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScheduleFormUiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScheduleFormUiComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
