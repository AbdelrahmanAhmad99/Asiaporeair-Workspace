import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditTicketVaultComponent } from './audit-ticket-vault.component';

describe('AuditTicketVaultComponent', () => {
  let component: AuditTicketVaultComponent;
  let fixture: ComponentFixture<AuditTicketVaultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuditTicketVaultComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuditTicketVaultComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
