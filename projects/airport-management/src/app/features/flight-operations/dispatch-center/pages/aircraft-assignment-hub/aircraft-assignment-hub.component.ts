
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
import { ActivatedRoute, Router } from '@angular/router';

import { FlightDispatchStore } from '../../store/flight-dispatch.store';
import { InstanceStatusCardComponent } from '../../components/instance-status-card/instance-status-card.component';
import { AircraftPickerModalComponent } from '../../components/aircraft-picker-modal/aircraft-picker-modal.component';
import { AircraftAvailabilityListComponent } from '../../components/aircraft-availability-list/aircraft-availability-list.component';

interface IToast { id: string; type: 'success' | 'error'; message: string; }

@Component({
  selector: 'aoms-aircraft-assignment-hub',
  standalone: true,
  imports: [
    CommonModule,
    InstanceStatusCardComponent,
    AircraftPickerModalComponent,
    AircraftAvailabilityListComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './aircraft-assignment-hub.component.html',
  styleUrl: './aircraft-assignment-hub.component.scss',
})
export class AircraftAssignmentHubComponent implements OnInit, OnDestroy {
  protected readonly store = inject(FlightDispatchStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  // ── Route param ──────────────────────────────────────────────────────
  protected readonly instanceId = signal<number>(0);

  // ── Store passthrough ─────────────────────────────────────────────────
  protected readonly instance = this.store.selectedInstance;
  protected readonly instanceLoading = this.store.instanceDetailLoading;
  protected readonly aircraft = this.store.availableAircraft;
  protected readonly timeline = this.store.aircraftTimeline;
  protected readonly timelineLoading = this.store.timelineLoading;
  protected readonly stagedTail = this.store.selectedTailNumber;
  protected readonly assignmentLoading = this.store.assignmentLoading;
  protected readonly assignmentError = this.store.assignmentErrorMessage;
  protected readonly hasConflict = this.store.hasStagingConflict;
  protected readonly isStaged = this.store.isAircraftStaged;
  protected readonly isProcessing = computed(() =>
    this.store.instanceDetailLoading() || this.store.assignmentLoading()
  );

  // ── Modal state ───────────────────────────────────────────────────────
  protected readonly pickerOpen = signal<boolean>(false);

  // ── Toast state ───────────────────────────────────────────────────────
  protected readonly toasts = signal<IToast[]>([]);
  private _toastTimers = new Map<string, ReturnType<typeof setTimeout>>();

  // ─────────────────────────────────────────────────────────────────────

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('instanceId') ?? 0);
    if (id > 0) {
      this.instanceId.set(id);
      this.store.loadInstanceDetails(id);
    }
  }

  ngOnDestroy(): void {
    this.store.clearAssignmentHub();
    this._toastTimers.forEach(t => clearTimeout(t));
    this._toastTimers.clear();
  }

  // ── Navigation ────────────────────────────────────────────────────────

  protected goToControlRoom(): void {
    this.router.navigate(['aoms/flight-operations/dispatch-center/flight-instance-control-room']);
  }

  protected openConflictResolution(): void {
    // Navigate to Control Room pre-filtered to the same date as this instance
    this.goToControlRoom();
  }

  // ── Picker ────────────────────────────────────────────────────────────

  protected openPicker(): void {
    this.store.clearAssignmentError();
    this.pickerOpen.set(true);
  }

  protected onPickerSelect(tailNumber: string): void {
    this.store.stageAircraft(tailNumber);
    this.store.loadAircraftSchedule(tailNumber);
  }

  protected onPickerConfirm(): void {
    // Close picker — staged aircraft + timeline now visible in hub panel
    this.pickerOpen.set(false);
  }

  protected onPickerDismiss(): void {
    this.pickerOpen.set(false);
    this.store.clearStagedAircraft();
  }

  // ── Finalize ──────────────────────────────────────────────────────────

  protected async finalizeAssignment(): Promise<void> {
    const id = this.instanceId();
    const tail = this.stagedTail();
    if (!id || !tail) return;

    const result = await this.store.executeAssignment(id, tail);

    if (result.success) {
      this.store.clearAssignmentSuccess();
      this._pushToast({
        id: _gid(),
        type: 'success',
        message: `${tail} has been confirmed for Flight #${id}. Assignment record created.`,
      });
    } else {
      this._pushToast({
        id: _gid(),
        type: 'error',
        message: result.error ?? 'Assignment failed. Please review and retry.',
      });
    }
  }

  protected cancelStaging(): void {
    this.store.clearStagedAircraft();
  }

  // ── Error ─────────────────────────────────────────────────────────────

  protected dismissError(): void {
    this.store.clearAssignmentError();
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