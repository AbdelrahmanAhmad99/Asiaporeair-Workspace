import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AirlineAuditCenterComponent } from './airline-audit-center.component';

describe('AirlineAuditCenterComponent', () => {
  let component: AirlineAuditCenterComponent;
  let fixture: ComponentFixture<AirlineAuditCenterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AirlineAuditCenterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AirlineAuditCenterComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
