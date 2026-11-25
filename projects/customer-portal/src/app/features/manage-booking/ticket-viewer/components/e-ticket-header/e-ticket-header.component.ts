// e-ticket-header.component.ts
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ITicketDetailDto } from '@shared-core';

@Component({
  selector: 'app-e-ticket-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './e-ticket-header.component.html',
  styleUrls: ['./e-ticket-header.component.scss']
})
export class ETicketHeaderComponent {
  @Input({ required: true }) ticket!: ITicketDetailDto;
  @Input() statusBadge: { label: string; cls: string } = { label: 'Valid', cls: 'badge--valid' };
  @Input() issueDate = '';
}