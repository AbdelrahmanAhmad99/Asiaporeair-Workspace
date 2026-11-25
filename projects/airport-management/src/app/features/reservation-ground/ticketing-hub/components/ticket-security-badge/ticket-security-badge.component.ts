
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeTheme = 'issued' | 'active' | 'used' | 'voided' | 'suspended' | 'refunded' | 'expired' | 'neutral';

const STATUS_THEME_MAP: Record<string, BadgeTheme> = {
  issued: 'issued',
  active: 'active',
  used: 'used',
  boarded: 'used',
  voided: 'voided',
  cancelled: 'voided',
  suspended: 'suspended',
  refunded: 'refunded',
  expired: 'expired',
};

const STATUS_LABELS: Record<BadgeTheme, string> = {
  issued: 'Issued',
  active: 'Active',
  used: 'Used',
  voided: 'Voided',
  suspended: 'Suspended',
  refunded: 'Refunded',
  expired: 'Expired',
  neutral: 'Unknown',
};

@Component({
  selector: 'aoms-ticket-security-badge',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ticket-security-badge.component.html',
  styleUrl: './ticket-security-badge.component.scss',
})
export class TicketSecurityBadgeComponent {
  readonly status = input.required<string>();

  readonly theme = computed<BadgeTheme>(() => {
    const key = (this.status() ?? '').toLowerCase();
    return STATUS_THEME_MAP[key] ?? 'neutral';
  });

  readonly label = computed<string>(() => STATUS_LABELS[this.theme()]);
}