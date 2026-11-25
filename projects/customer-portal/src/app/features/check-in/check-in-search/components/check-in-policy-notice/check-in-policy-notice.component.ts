// ============================================================================
// check-in-policy-notice.component.ts
// Asiaporeair | Check-in Windows & Policy — Accordion Info Panel
// ============================================================================

import {
  Component, ChangeDetectionStrategy, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';

interface IPolicyItem {
  icon: string;         // SVG path(s)
  title: string;
  detail: string;
  isHighlight?: boolean;
}

@Component({
  selector: 'app-check-in-policy-notice',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './check-in-policy-notice.component.html',
  styleUrls: ['./check-in-policy-notice.component.scss']
})
export class CheckInPolicyNoticeComponent {
  readonly isExpanded = signal<boolean>(false);

  readonly policies: IPolicyItem[] = [
    {
      icon: 'clock',
      title: 'Check-in Window',
      detail: 'Online check-in opens 48 hours before departure and closes 90 minutes prior to your scheduled flight.',
      isHighlight: true
    },
    {
      icon: 'passport',
      title: 'Travel Documents',
      detail: 'All passengers must carry a valid passport or government-issued ID. Ensure documents match your booking details exactly.'
    },
    {
      icon: 'luggage',
      title: 'Baggage Allowance',
      detail: 'Checked baggage allowance varies by cabin class and fare type. Review your booking confirmation for specific limits.'
    },
    {
      icon: 'shield',
      title: 'Security Notice',
      detail: 'Prohibited items must not be carried in hand or checked baggage. Review our security guidelines before your journey.'
    }
  ];
}