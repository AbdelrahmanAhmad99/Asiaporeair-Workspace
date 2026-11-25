
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AirlinesStore, AirlineAuditFilter } from '../../store/airlines.store';
import { AirlineAuditListComponent } from '../../components/airline-audit-list/airline-audit-list.component';

interface IToast {
  id: string;
  type: 'success' | 'error';
  message: string;
  iataCode?: string;
}

@Component({
  selector: 'aoms-airline-audit-center',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AirlineAuditListComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './airline-audit-center.component.html',
  styleUrl: './airline-audit-center.component.scss',
})
export class AirlineAuditCenterComponent implements OnInit, OnDestroy {
  protected readonly store = inject(AirlinesStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // ── Store passthrough ─────────────────────────────────────────────────
  protected readonly records = this.store.filteredAuditRecords;
  protected readonly activeSet = this.store.activeAirlineSet;
  protected readonly loading = this.store.auditLoading;
  protected readonly currentFilter = this.store.auditFilter;
  protected readonly backendError = this.store.backendError;
  protected readonly restoringCode = this.store.restoringIataCode;
  protected readonly deactivatedCount = this.store.deactivatedAirlineCount;
  protected readonly totalCount = computed(() => this.store.auditRecords().length);

  // ── Local UI state ────────────────────────────────────────────────────
  protected readonly searchQuery = signal<string>('');
  protected readonly toasts = signal<IToast[]>([]);
  protected readonly errorIataCode = signal<string | null>(null);

  /** Controls the "Quick Navigate" IATA code input panel. */
  protected readonly navPanelOpen = signal<boolean>(false);
  protected readonly navIataInput = signal<string>('');

  private _searchTimer: ReturnType<typeof setTimeout> | null = null;
  private _toastTimers = new Map<string, ReturnType<typeof setTimeout>>();

  // ── Filter options ────────────────────────────────────────────────────
  protected readonly filterOptions: {
    label: string;
    value: AirlineAuditFilter;
    icon: string;
  }[] = [
      {
        label: 'All Records',
        value: 'all',
        icon: 'M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5',
      },
      {
        label: 'Suspended',
        value: 'deactivated',
        icon: 'm18.364 18.364-12.728-12.728m12.728 0-12.728 12.728',
      },
      {
        label: 'Operational',
        value: 'active',
        icon: 'M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
      },
    ];

  // ─────────────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.store.fetchAuditHistory();

    // Pre-populate search if an iataCode query param was passed from Details
    const queryIata = this.route.snapshot.queryParamMap.get('iataCode');
    if (queryIata) {
      this.searchQuery.set(queryIata.toUpperCase());
      this.store.setAuditSearch(queryIata.toUpperCase());
    }
  }

  ngOnDestroy(): void {
    this.store.clearAuditCenter();
    if (this._searchTimer) clearTimeout(this._searchTimer);
    this._toastTimers.forEach(t => clearTimeout(t));
    this._toastTimers.clear();
  }

  // ── Navigation ────────────────────────────────────────────────────────

  protected returnToDashboard(): void {
    this.router.navigate(['aoms/network-infrastructure/airline-partnership-directory/dashboard']);
  }

  protected openNavPanel(): void {
    this.navPanelOpen.set(true);
    this.navIataInput.set('');
  }

  protected closeNavPanel(): void {
    this.navPanelOpen.set(false);
    this.navIataInput.set('');
  }

  protected onNavInput(value: string): void {
    this.navIataInput.set(value.toUpperCase().slice(0, 2));
  }

  protected navigateToDetails(): void {
    const code = this.navIataInput().trim().toUpperCase();
    if (!code) return;
    this.closeNavPanel();
    this.router.navigate([
      'aoms/network-infrastructure/airline-partnership-directory/details',
      code,
    ]);
  }

  // ── Filter + Search ───────────────────────────────────────────────────

  protected setFilter(filter: AirlineAuditFilter): void {
    this.store.setAuditFilter(filter);
  }

  protected onSearchInput(value: string): void {
    this.searchQuery.set(value);
    if (this._searchTimer) clearTimeout(this._searchTimer);
    this._searchTimer = setTimeout(() => {
      this.store.setAuditSearch(value);
    }, 200);
  }

  protected clearSearch(): void {
    this.searchQuery.set('');
    this.store.setAuditSearch('');
  }

  // ── Refresh ───────────────────────────────────────────────────────────

  protected refresh(): void {
    this.store.fetchAuditHistory();
  }

  protected dismissBackendError(): void {
    this.store.clearBackendError();
  }

  // ── Restore ───────────────────────────────────────────────────────────

  protected async onReactivate(iataCode: string): Promise<void> {
    this.errorIataCode.set(null);
    const result = await this.store.restoreAirline(iataCode);

    if (result.success) {
      this._pushToast({
        id: _genId(),
        type: 'success',
        message: `${iataCode} has been restored to the active partner network.`,
        iataCode: result.iataCode,
      });
    } else {
      this.errorIataCode.set(iataCode);
      this._pushToast({
        id: _genId(),
        type: 'error',
        message: result.error ?? `Failed to restore ${iataCode}.`,
        iataCode: result.iataCode,
      });
      // Reset errorIataCode after the button's error phase duration
      setTimeout(() => {
        if (this.errorIataCode() === iataCode) {
          this.errorIataCode.set(null);
        }
      }, 3500);
    }
  }

  protected dismissToast(id: string): void {
    this.toasts.update(list => list.filter(t => t.id !== id));
    const timer = this._toastTimers.get(id);
    if (timer) { clearTimeout(timer); this._toastTimers.delete(id); }
  }

  // ── Private ───────────────────────────────────────────────────────────

  private _pushToast(toast: IToast): void {
    this.toasts.update(list => [...list, toast]);
    const timer = setTimeout(() => {
      this.toasts.update(list => list.filter(t => t.id !== toast.id));
      this._toastTimers.delete(toast.id);
    }, 4500);
    this._toastTimers.set(toast.id, timer);
  }
}

function _genId(): string {
  return Math.random().toString(36).slice(2, 10);
}