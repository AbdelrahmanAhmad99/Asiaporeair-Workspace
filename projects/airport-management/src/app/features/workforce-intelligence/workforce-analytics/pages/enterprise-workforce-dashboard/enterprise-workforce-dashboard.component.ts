

import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { animate, style, transition, trigger } from '@angular/animations';

import { WorkforceWadStore } from '../../store/workforce-wad.store';
import { AnalyticsSummaryWidgetsComponent } from '../../components/analytics-summary-widgets/analytics-summary-widgets.component';
import { WorkforceRatioChartComponent } from '../../components/workforce-ratio-chart/workforce-ratio-chart.component';

const AOMS_WI = 'aoms/workforce-intelligence';

const PAGE_ENTER = trigger('pageEnter', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(12px)' }),
    animate('350ms 30ms cubic-bezier(0.4,0,0.2,1)',
      style({ opacity: 1, transform: 'translateY(0)' })),
  ]),
]);

@Component({
  selector: 'aoms-enterprise-workforce-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    AnalyticsSummaryWidgetsComponent,
    WorkforceRatioChartComponent,
  ],
  animations: [PAGE_ENTER],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './enterprise-workforce-dashboard.component.html',
  styleUrl: './enterprise-workforce-dashboard.component.scss',
})
export class EnterpriseWorkforceDashboardComponent implements OnInit {
  protected readonly store = inject(WorkforceWadStore);
  private readonly router = inject(Router);

  protected readonly isDarkMode = signal<boolean>(
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('aoms-dark')
  );

  // Expose the kpis only when analytics is available
  protected readonly kpis = computed(() => this.store.kpis());

  protected readonly lastRefreshedLabel = computed(() => {
    const d = this.store.lastRefreshed();
    if (!d) return null;
    return d.toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  });

  ngOnInit(): void {
    this.store.loadDashboardAnalytics();
  }

  // ── Navigation ──────────────────────────────────────────────────────
  protected goToCrewIntelligence(): void {
    this.router.navigate([AOMS_WI, 'workforce-analytics', 'crew-intelligence']);
  }

  protected goToRecruitmentTrends(): void {
    this.router.navigate([AOMS_WI, 'workforce-analytics', 'recruitment-trends']);
  }

  protected toggleDarkMode(): void {
    const next = !this.isDarkMode();
    document.documentElement.classList.toggle('aoms-dark', next);
    this.isDarkMode.set(next);
  }

  protected onRetry(): void {
    this.store.loadDashboardAnalytics();
  }
}