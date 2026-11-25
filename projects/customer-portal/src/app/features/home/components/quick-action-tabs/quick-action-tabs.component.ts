
import {
  Component, Input, Output, EventEmitter, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuickTab } from '../../pages/home/home.component';

interface TabItem {
  id: QuickTab;
  label: string;
  icon: string; // SVG path string
}

@Component({
  selector: 'app-quick-action-tabs',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './quick-action-tabs.component.html',
  styleUrl: './quick-action-tabs.component.scss',
})
export class QuickActionTabsComponent {
  @Input() activeTab!: QuickTab;
  @Output() tabChange = new EventEmitter<QuickTab>();

  readonly tabs: TabItem[] = [
    {
      id: 'book',
      label: 'Begin Your Journey',
      icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
    },
    {
      id: 'manage',
      label: 'Manage Booking',
      icon: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2',
    },
    {
      id: 'checkin',
      label: 'Boarding Check-in',
      icon: 'M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11',
    },
    {
      id: 'status',
      label: 'Flight Status',
      icon: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.63 3.38 2 2 0 0 1 3.62 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.56a16 16 0 0 0 6.29 6.29l1.62-.97a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z',
    },
    {
      id: 'ticket',
      label: 'Retrieve Tickets',
      icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
    },
  ];
}