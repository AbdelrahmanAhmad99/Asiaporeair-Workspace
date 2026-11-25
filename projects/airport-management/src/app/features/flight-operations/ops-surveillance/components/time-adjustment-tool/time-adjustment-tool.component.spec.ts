import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeAdjustmentToolComponent } from './time-adjustment-tool.component';

describe('TimeAdjustmentToolComponent', () => {
  let component: TimeAdjustmentToolComponent;
  let fixture: ComponentFixture<TimeAdjustmentToolComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimeAdjustmentToolComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimeAdjustmentToolComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
