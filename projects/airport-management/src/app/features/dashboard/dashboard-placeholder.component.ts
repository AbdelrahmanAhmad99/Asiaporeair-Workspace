// Placeholder component for Dashboard — will be replaced with real implementation
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-placeholder',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="placeholder">
      <div class="placeholder__icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
        </svg>
      </div>
      <h2 class="placeholder__title">Operations Center</h2>
      <p class="placeholder__subtitle">Real-time dashboard with fleet status, flight metrics, and crew availability will be implemented here.</p>
      <div class="placeholder__stats">
        <div class="placeholder__stat">
          <span class="placeholder__stat-value">—</span>
          <span class="placeholder__stat-label">Active Flights</span>
        </div>
        <div class="placeholder__stat">
          <span class="placeholder__stat-value">—</span>
          <span class="placeholder__stat-label">Aircraft Online</span>
        </div>
        <div class="placeholder__stat">
          <span class="placeholder__stat-value">—</span>
          <span class="placeholder__stat-label">Crew On Duty</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .placeholder {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      min-height: 60vh; text-align: center; padding: 48px 24px;
    }
    .placeholder__icon {
      width: 64px; height: 64px; border-radius: 16px;
      background: rgba(182,143,36,0.08); display: flex; align-items: center; justify-content: center;
      margin-bottom: 24px;
      svg { width: 32px; height: 32px; color: #B68F24; }
    }
    .placeholder__title {
      font-family: 'Montserrat', sans-serif; font-size: 24px; font-weight: 700;
      letter-spacing: -0.02em; color: var(--aoms-text-primary); margin-bottom: 8px;
    }
    .placeholder__subtitle {
      font-size: 14px; color: var(--aoms-text-secondary); max-width: 480px; line-height: 1.6;
      margin-bottom: 32px;
    }
    .placeholder__stats {
      display: flex; gap: 32px;
    }
    .placeholder__stat {
      display: flex; flex-direction: column; align-items: center; gap: 4px;
      padding: 16px 24px; border-radius: 12px; background: var(--aoms-bg-card);
      border: 1px solid var(--aoms-border-subtle); box-shadow: var(--aoms-shadow-card);
    }
    .placeholder__stat-value {
      font-family: 'Montserrat', sans-serif; font-size: 28px; font-weight: 700; color: #B68F24;
    }
    .placeholder__stat-label {
      font-size: 11px; font-weight: 500; color: var(--aoms-text-muted); text-transform: uppercase;
      letter-spacing: 0.06em;
    }
  `],
})
export class DashboardPlaceholderComponent {}
