import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketIssuanceProgressComponent } from './ticket-issuance-progress.component';

describe('TicketIssuanceProgressComponent', () => {
  let component: TicketIssuanceProgressComponent;
  let fixture: ComponentFixture<TicketIssuanceProgressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketIssuanceProgressComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TicketIssuanceProgressComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
