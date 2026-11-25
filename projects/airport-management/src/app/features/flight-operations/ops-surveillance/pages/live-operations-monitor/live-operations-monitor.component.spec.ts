import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiveOperationsMonitorComponent } from './live-operations-monitor.component';

describe('LiveOperationsMonitorComponent', () => {
  let component: LiveOperationsMonitorComponent;
  let fixture: ComponentFixture<LiveOperationsMonitorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LiveOperationsMonitorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LiveOperationsMonitorComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
