import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FareAuditTableComponent } from './fare-audit-table.component';

describe('FareAuditTableComponent', () => {
  let component: FareAuditTableComponent;
  let fixture: ComponentFixture<FareAuditTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FareAuditTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FareAuditTableComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
