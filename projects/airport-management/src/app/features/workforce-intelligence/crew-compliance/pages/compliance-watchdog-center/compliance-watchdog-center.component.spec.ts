import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplianceWatchdogCenterComponent } from './compliance-watchdog-center.component';

describe('ComplianceWatchdogCenterComponent', () => {
  let component: ComplianceWatchdogCenterComponent;
  let fixture: ComponentFixture<ComplianceWatchdogCenterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComplianceWatchdogCenterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComplianceWatchdogCenterComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
