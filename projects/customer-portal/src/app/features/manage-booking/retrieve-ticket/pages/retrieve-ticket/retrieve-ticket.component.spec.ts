import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetrieveTicketComponent } from './retrieve-ticket.component';

describe('RetrieveTicketComponent', () => {
  let component: RetrieveTicketComponent;
  let fixture: ComponentFixture<RetrieveTicketComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RetrieveTicketComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RetrieveTicketComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
