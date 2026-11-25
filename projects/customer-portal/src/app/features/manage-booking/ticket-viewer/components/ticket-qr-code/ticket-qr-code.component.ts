// ticket-qr-code.component.ts
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ticket-qr-code',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './ticket-qr-code.component.html',
  styleUrls: ['./ticket-qr-code.component.scss']
})
export class TicketQrCodeComponent {
  @Input({ required: true }) ticketCode!: string;
  @Input() passengerName = '';
  @Input() isValid = true;
}