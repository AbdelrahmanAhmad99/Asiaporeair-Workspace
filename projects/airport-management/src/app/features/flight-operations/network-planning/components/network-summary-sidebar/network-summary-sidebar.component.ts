

import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IScheduleSummaryStats } from '../../store/network-planning.store';

@Component({
  selector: 'aoms-network-summary-sidebar',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './network-summary-sidebar.component.html',
  styleUrl: './network-summary-sidebar.component.scss',
})
export class NetworkSummarySidebarComponent {
  readonly stats = input.required<IScheduleSummaryStats>();
  readonly loading = input<boolean>(false);

  readonly onNewSchedule = output<void>();
  readonly onAuditLogs = output<void>();

  protected readonly shimmerRows = Array(3).fill(null);
}