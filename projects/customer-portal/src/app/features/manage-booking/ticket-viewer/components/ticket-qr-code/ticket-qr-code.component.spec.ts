import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketQrCodeComponent } from './ticket-qr-code.component';

describe('TicketQrCodeComponent', () => {
  let component: TicketQrCodeComponent;
  let fixture: ComponentFixture<TicketQrCodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketQrCodeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TicketQrCodeComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
