import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketSecurityInfoComponent } from './ticket-security-info.component';

describe('TicketSecurityInfoComponent', () => {
  let component: TicketSecurityInfoComponent;
  let fixture: ComponentFixture<TicketSecurityInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketSecurityInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TicketSecurityInfoComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
