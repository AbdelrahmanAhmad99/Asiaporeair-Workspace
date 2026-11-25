import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketIssuanceConsoleComponent } from './ticket-issuance-console.component';

describe('TicketIssuanceConsoleComponent', () => {
  let component: TicketIssuanceConsoleComponent;
  let fixture: ComponentFixture<TicketIssuanceConsoleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketIssuanceConsoleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TicketIssuanceConsoleComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
