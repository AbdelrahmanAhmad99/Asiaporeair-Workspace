import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleConfigurationCenterComponent } from './schedule-configuration-center.component';

describe('ScheduleConfigurationCenterComponent', () => {
  let component: ScheduleConfigurationCenterComponent;
  let fixture: ComponentFixture<ScheduleConfigurationCenterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScheduleConfigurationCenterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScheduleConfigurationCenterComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
