// ============================================================================
// login-history-list.component.ts
// Asiaporeair | Dumb Component — Login / Device Session History
// ============================================================================

import {
  Component, Input, Output, EventEmitter, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ILoginHistoryRecord } from '../../../store/profile.store';

@Component({
  selector: 'app-login-history-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './login-history-list.component.html',
  styleUrls: ['./login-history-list.component.scss']
})
export class LoginHistoryListComponent {

  @Input() records: ILoginHistoryRecord[] = [];
  @Input() isLoading: boolean = false;

  @Output() revokeSession = new EventEmitter<string>();

  /** Skeleton placeholder array */
  readonly skeletonRows = [1, 2, 3, 4];

  onRevoke(sessionId: string): void {
    this.revokeSession.emit(sessionId);
  }

  formatDate(iso: string): string {
    try {
      return new Date(iso).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric'
      });
    } catch { return iso; }
  }

  formatTime(iso: string): string {
    try {
      return new Date(iso).toLocaleTimeString('en-GB', {
        hour: '2-digit', minute: '2-digit', hour12: true
      }).toUpperCase();
    } catch { return ''; }
  }

  deviceIcon(type: ILoginHistoryRecord['deviceType']): string {
    const icons: Record<string, string> = {
      desktop: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
        <rect x="2" y="3" width="20" height="14" rx="2"/>
        <line x1="8" y1="21" x2="16" y2="21"/>
        <line x1="12" y1="17" x2="12" y2="21"/>
      </svg>`,
      mobile: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
        <line x1="12" y1="18" x2="12.01" y2="18"/>
      </svg>`,
      tablet: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
        <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
        <line x1="12" y1="18" x2="12.01" y2="18"/>
      </svg>`,
      unknown: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>`
    };
    return icons[type] ?? icons['unknown'];
  }
}