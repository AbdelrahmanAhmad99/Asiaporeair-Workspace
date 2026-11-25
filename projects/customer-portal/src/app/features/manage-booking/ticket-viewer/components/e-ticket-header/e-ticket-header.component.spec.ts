import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ETicketHeaderComponent } from './e-ticket-header.component';

describe('ETicketHeaderComponent', () => {
  let component: ETicketHeaderComponent;
  let fixture: ComponentFixture<ETicketHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ETicketHeaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ETicketHeaderComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
