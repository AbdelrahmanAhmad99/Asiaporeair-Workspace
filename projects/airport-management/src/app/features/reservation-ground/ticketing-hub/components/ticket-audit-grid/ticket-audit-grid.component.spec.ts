import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketAuditGridComponent } from './ticket-audit-grid.component';

describe('TicketAuditGridComponent', () => {
  let component: TicketAuditGridComponent;
  let fixture: ComponentFixture<TicketAuditGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketAuditGridComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TicketAuditGridComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
