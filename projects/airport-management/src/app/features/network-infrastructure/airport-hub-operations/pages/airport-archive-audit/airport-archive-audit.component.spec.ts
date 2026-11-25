import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AirportArchiveAuditComponent } from './airport-archive-audit.component';

describe('AirportArchiveAuditComponent', () => {
  let component: AirportArchiveAuditComponent;
  let fixture: ComponentFixture<AirportArchiveAuditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AirportArchiveAuditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AirportArchiveAuditComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
