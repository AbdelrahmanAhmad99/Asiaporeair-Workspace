import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimelineMilestoneComponent } from './timeline-milestone.component';

describe('TimelineMilestoneComponent', () => {
  let component: TimelineMilestoneComponent;
  let fixture: ComponentFixture<TimelineMilestoneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimelineMilestoneComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimelineMilestoneComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
