import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketSecurityBadgeComponent } from './ticket-security-badge.component';

describe('TicketSecurityBadgeComponent', () => {
  let component: TicketSecurityBadgeComponent;
  let fixture: ComponentFixture<TicketSecurityBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketSecurityBadgeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TicketSecurityBadgeComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
