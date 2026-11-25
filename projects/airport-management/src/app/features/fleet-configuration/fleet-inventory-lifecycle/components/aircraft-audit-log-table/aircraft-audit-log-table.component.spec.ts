import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AircraftAuditLogTableComponent } from './aircraft-audit-log-table.component';

describe('AircraftAuditLogTableComponent', () => {
  let component: AircraftAuditLogTableComponent;
  let fixture: ComponentFixture<AircraftAuditLogTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AircraftAuditLogTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AircraftAuditLogTableComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
