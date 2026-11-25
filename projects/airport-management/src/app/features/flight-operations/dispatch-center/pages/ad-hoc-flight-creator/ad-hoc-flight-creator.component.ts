
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
import { Router } from '@angular/router';

import { FlightDispatchStore } from '../../store/flight-dispatch.store';
import { AdHocFlightFormComponent } from '../../components/ad-hoc-flight-form/ad-hoc-flight-form.component';
import { ICreateAdHocFlightInstanceDto } from '@shared-core';

interface IToast { id: string; type: 'success' | 'error'; message: string; }

@Component({
  selector: 'aoms-ad-hoc-flight-creator',
  standalone: true,
  imports: [CommonModule, AdHocFlightFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ad-hoc-flight-creator.component.html',
  styleUrl: './ad-hoc-flight-creator.component.scss',
})
export class AdHocFlightCreatorComponent implements OnInit, OnDestroy {
  protected readonly store = inject(FlightDispatchStore);
  private readonly router = inject(Router);

  // ── Store passthrough ─────────────────────────────────────────────────
  protected readonly routes = this.store.availableRoutes;
  protected readonly airlines = this.store.activeAirlines;
  protected readonly aircraft = this.store.selectableAircraft;
  protected readonly isSubmitting = this.store.isSubmitting;
  protected readonly formError = this.store.adHocErrorMessage;
  protected readonly refLoading = this.store.refDataLoading;
  protected readonly isAnyLoading = computed(() =>
    this.store.refDataLoading() || this.store.isSubmitting()
  );

  // ── Toast state ───────────────────────────────────────────────────────
  protected readonly toasts = signal<IToast[]>([]);
  private _toastTimers = new Map<string, ReturnType<typeof setTimeout>>();
  private _navTimer: ReturnType<typeof setTimeout> | null = null;

  // ─────────────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.store.clearAdHocError();
    this.store.loadReferenceData();
  }

  ngOnDestroy(): void {
    this.store.clearAdHocError();
    this.store.clearCreatedAdHocFlight();
    this._toastTimers.forEach(t => clearTimeout(t));
    this._toastTimers.clear();
    if (this._navTimer) clearTimeout(this._navTimer);
  }

  // ── Navigation ────────────────────────────────────────────────────────

  protected goToControlRoom(): void {
    this.router.navigate([
      'aoms/flight-operations/dispatch-center/flight-instance-control-room',
    ]);
  }

  protected refreshRefData(): void {
    this.store.invalidateRefData();
    this.store.loadReferenceData();
  }

  // ── Form submission ───────────────────────────────────────────────────

  protected async onFormSubmit(payload: ICreateAdHocFlightInstanceDto): Promise<void> {
    const result = await this.store.submitAdHocFlight(payload);

    if (result.success && result.instanceId) {
      this._pushToast({
        id: _gid(),
        type: 'success',
        message: `Mission ${payload.flightNo} authorized · Instance #${result.instanceId} created. Redirecting to Control Room…`,
      });
      // Auto-navigate to Control Room after 2 seconds
      this._navTimer = setTimeout(() => {
        this.store.clearCreatedAdHocFlight();
        this.goToControlRoom();
      }, 2000);
    }
    // Error case: formError signal is already set in the store — passed down to form
  }

  // ── Toast ─────────────────────────────────────────────────────────────

  protected dismissToast(id: string): void {
    this.toasts.update(l => l.filter(t => t.id !== id));
    const t = this._toastTimers.get(id);
    if (t) { clearTimeout(t); this._toastTimers.delete(id); }
  }

  private _pushToast(toast: IToast): void {
    this.toasts.update(l => [...l, toast]);
    const t = setTimeout(() => {
      this.toasts.update(l => l.filter(x => x.id !== toast.id));
      this._toastTimers.delete(toast.id);
    }, 5000);
    this._toastTimers.set(toast.id, t);
  }
}

function _gid(): string { return Math.random().toString(36).slice(2, 10); }