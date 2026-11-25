import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FareAuditArchiveComponent } from './fare-audit-archive.component';

describe('FareAuditArchiveComponent', () => {
  let component: FareAuditArchiveComponent;
  let fixture: ComponentFixture<FareAuditArchiveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FareAuditArchiveComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FareAuditArchiveComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
