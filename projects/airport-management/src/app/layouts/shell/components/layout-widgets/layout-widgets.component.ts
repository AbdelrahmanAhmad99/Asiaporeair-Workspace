// AOMS Layout Widgets — Quick Action Floating Menu

import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface QuickAction {
  id: string;
  label: string;
  icon: string; // SVG path data
  color: string;
}

@Component({
  selector: 'app-layout-widgets',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './layout-widgets.component.html',
  styleUrl: './layout-widgets.component.scss',
})
export class LayoutWidgetsComponent {

  /** Toggle state for the floating menu */
  protected readonly isOpen = signal<boolean>(false);

  /** Quick action items */
  protected readonly actions = signal<QuickAction[]>([
    {
      id: 'create-flight',
      label: 'Create Flight Instance',
      icon: 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8',
      color: '#B68F24',
    },
    {
      id: 'add-crew',
      label: 'Add Crew Member',
      icon: 'M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2m5.5-7.5a4 4 0 110-8 4 4 0 010 8zM20 8v6M23 11h-6',
      color: '#064E3B',
    },
    {
      id: 'issue-ticket',
      label: 'Issue Ticket',
      icon: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z',
      color: '#051937',
    },
    {
      id: 'new-booking',
      label: 'New Booking',
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
      color: '#B45309',
    },
  ]);

  protected toggleMenu(): void {
    this.isOpen.update(v => !v);
  }

  protected onActionClick(action: QuickAction): void {
    // Placeholder — dispatch navigation or modal open
    console.log(`[AOMS Quick Action] ${action.label}`);
    this.isOpen.set(false);
  }
}
