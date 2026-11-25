import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DutyEventStripComponent } from './duty-event-strip.component';

describe('DutyEventStripComponent', () => {
  let component: DutyEventStripComponent;
  let fixture: ComponentFixture<DutyEventStripComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DutyEventStripComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DutyEventStripComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
