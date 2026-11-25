

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
import {
  animate, style, transition, trigger,
} from '@angular/animations';

import { WorkforceWadStore } from '../../store/workforce-wad.store';
import { CrewReadinessGaugeComponent } from '../../components/crew-readiness-gauge/crew-readiness-gauge.component';
import { OperationalStatsPanelComponent } from '../../components/operational-stats-panel/operational-stats-panel.component';

const WAD_BASE = 'aoms/workforce-intelligence/workforce-analytics';

const CIH_ANIMATIONS = [
  trigger('cockpitIn', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateY(14px)' }),
      animate('360ms 20ms cubic-bezier(0.4,0,0.2,1)',
        style({ opacity: 1, transform: 'translateY(0)' })),
    ]),
  ]),
  trigger('radarSweep', [
    transition(':enter', [
      style({ opacity: 0, transform: 'scale(0.92) rotate(-6deg)' }),
      animate('450ms 80ms cubic-bezier(0.34,1.56,0.64,1)',
        style({ opacity: 1, transform: 'scale(1) rotate(0deg)' })),
    ]),
  ]),
];

@Component({
  selector: 'aoms-crew-intelligence-hub',
  standalone: true,
  imports: [
    CommonModule,
    CrewReadinessGaugeComponent,
    OperationalStatsPanelComponent,
  ],
  animations: CIH_ANIMATIONS,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './crew-intelligence-hub.component.html',
  styleUrl: './crew-intelligence-hub.component.scss',
})
export class CrewIntelligenceHubComponent implements OnInit {
  protected readonly store = inject(WorkforceWadStore);
  private readonly router = inject(Router);

  protected readonly isDarkMode = signal<boolean>(
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('aoms-dark')
  );

  protected readonly crewKpis = computed(() => this.store.crewKpis());
  protected readonly readiness = computed(() => this.store.readinessPercentage());

  protected readonly lastRefreshedLabel = computed(() => {
    const kpis = this.crewKpis();
    if (!kpis?.lastUpdated) return null;
    try {
      return new Date(kpis.lastUpdated).toLocaleTimeString('en-SG',
        { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch { return kpis.lastUpdated; }
  });

  ngOnInit(): void {
    this.store.loadCrewIntelligenceData();
  }

  // ── Navigation ──────────────────────────────────────────────────────
  protected goToEnterpriseDashboard(): void {
    this.router.navigate([WAD_BASE, 'enterprise-dashboard']);
  }

  protected goToWorkforceDirectory(): void {
    this.router.navigate(['aoms/workforce-intelligence/workforce-directory/inventory-dashboard']);
  }

  protected goToAvailabilityExplorer(): void {
    this.router.navigate(['aoms/workforce-intelligence/tactical-rostering/availability-explorer']);
  }

  protected toggleDarkMode(): void {
    const next = !this.isDarkMode();
    document.documentElement.classList.toggle('aoms-dark', next);
    this.isDarkMode.set(next);
  }

  // ── Actions ─────────────────────────────────────────────────────────
  protected onReInitialize(): void {
    this.store.clearCrewError();
    this.store.loadCrewIntelligenceData();
  }

  protected onRefresh(): void {
    this.store.loadCrewIntelligenceData();
  }
}