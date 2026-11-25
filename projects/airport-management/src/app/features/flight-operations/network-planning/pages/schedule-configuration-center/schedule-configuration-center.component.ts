
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { NetworkPlanningStore } from '../../store/network-planning.store';
import { ScheduleFormUiComponent, } from '../../components/schedule-form-ui/schedule-form-ui.component';
import { LegTimelineVisualizerComponent } from '../../components/leg-timeline-visualizer/leg-timeline-visualizer.component';
import { LegItemCardComponent } from '../../components/leg-item-card/leg-item-card.component';
import { LegConfigDialogComponent } from '../../components/leg-config-dialog/leg-config-dialog.component';
import {
  IFlightLegDefDto,
  ICreateFlightScheduleDto,
  ICreateFlightLegDefDto,
  AirlinesService,
  AircraftTypesService,
  AirportsService,
  IAirlineDto,
  IAircraftTypeDto,
  IAirportDto
} from '@shared-core';

interface IToast { id: string; type: 'success' | 'error'; message: string; }

@Component({
  selector: 'aoms-schedule-configuration-center',
  standalone: true,
  imports: [
    CommonModule,
    ScheduleFormUiComponent,
    LegTimelineVisualizerComponent,
    LegItemCardComponent,
    LegConfigDialogComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './schedule-configuration-center.component.html',
  styleUrl: './schedule-configuration-center.component.scss',
})
export class ScheduleConfigurationCenterComponent implements OnInit, OnDestroy {
  protected readonly store = inject(NetworkPlanningStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly airlinesSvc = inject(AirlinesService);
  private readonly aircraftTypesSvc = inject(AircraftTypesService);
  private readonly airportsSvc = inject(AirportsService);

  // ── Store passthrough ─────────────────────────────────────────────────
  protected readonly schedule = this.store.selectedSchedule;
  protected readonly legs = this.store.sortedLegs;
  protected readonly isConfigLoading = this.store.isConfigLoading;
  protected readonly isSavingSchedule = this.store.isSavingSchedule;
  protected readonly isLegSaving = this.store.isLegSaving;
  protected readonly configError = this.store.configErrorMessage;
  protected readonly totalBlockMins = this.store.totalBlockMinutes;
  protected readonly hasTimeConflict = this.store.hasTimeConflict;
  protected readonly nextLegSeq = this.store.nextLegSequence;
  protected readonly isAnyProcessing = computed(() =>
    this.store.isSavingSchedule() || this.store.isLegSaving()
  );

  // ── Mode ─────────────────────────────────────────────────────────────
  protected readonly isEditMode = signal<boolean>(false);
  protected readonly scheduleId = signal<number | null>(null);

  // ── Page metadata ─────────────────────────────────────────────────────
  protected readonly pageTitle = computed<string>(() =>
    this.isEditMode()
      ? `Refine Schedule #${this.scheduleId()}`
      : 'New Schedule Construction'
  );

  // ── Unsaved-changes guard ─────────────────────────────────────────────
  protected readonly isDirty = signal<boolean>(false);
  protected readonly exitModalOpen = signal<boolean>(false);
  protected readonly pendingNavTarget = signal<string | null>(null);

  // ── Leg dialog ────────────────────────────────────────────────────────
  protected readonly legDialogOpen = signal<boolean>(false);
  protected readonly editLegTarget = signal<IFlightLegDefDto | null>(null);
  protected readonly legDialogError = signal<string | null>(null);

  // ── Toast ─────────────────────────────────────────────────────────────
  protected readonly toasts = signal<IToast[]>([]);
  private _toastTimers = new Map<string, ReturnType<typeof setTimeout>>();

  // ── Master data ────────────────────────────────────────────────────────
  protected readonly activeAirlines = signal<IAirlineDto[]>([]);
  protected readonly activeAircraftTypes = signal<IAircraftTypeDto[]>([]);
  protected readonly activeAirports = signal<IAirportDto[]>([]);

  // ── @ViewChild for imperative header submit ───────────────────────────
  @ViewChild(ScheduleFormUiComponent) private formRef?: ScheduleFormUiComponent;

  // ─────────────────────────────────────────────────────────────────────

  ngOnInit(): void {
    const raw = this.route.snapshot.paramMap.get('id');
    const id = raw && raw !== 'new' ? Number(raw) : null;
    const isEdit = !!id && id > 0;

    this.isEditMode.set(isEdit);
    this.scheduleId.set(isEdit ? id : null);
    this.store.clearConfigError();

    // Fetch master data
    this.airlinesSvc.getAllActiveAirlines().subscribe(list => this.activeAirlines.set(list));
    this.aircraftTypesSvc.getAllActiveAircraftTypes().subscribe(list => this.activeAircraftTypes.set(list));
    this.airportsSvc.getAllActiveAirports().subscribe(list => this.activeAirports.set(list));

    if (isEdit) {
      this.store.loadScheduleDetails(id!);
    } else {
      this.store.clearSelectedSchedule();
    }
  }

  ngOnDestroy(): void {
    this.store.clearConfigError();
    this.store.clearSavedScheduleId();
    this._toastTimers.forEach(t => clearTimeout(t));
    this._toastTimers.clear();
  }

  // ── Navigation ────────────────────────────────────────────────────────

  protected returnToInventory(): void {
    if (this.isDirty()) {
      this.pendingNavTarget.set('inventory');
      this.exitModalOpen.set(true);
    } else {
      this._goToInventory();
    }
  }

  protected discardDraft(): void {
    if (this.isDirty()) {
      this.pendingNavTarget.set('inventory');
      this.exitModalOpen.set(true);
    } else {
      this._goToInventory();
    }
  }

  protected cancelExit(): void {
    this.exitModalOpen.set(false);
    this.pendingNavTarget.set(null);
  }

  protected confirmExit(): void {
    this.exitModalOpen.set(false);
    this.isDirty.set(false);
    this._goToInventory();
  }

  private _goToInventory(): void {
    this.router.navigate(['aoms/flight-operations/network-planning/schedule-master-inventory']);
  }

  // ── Save schedule (header button) ─────────────────────────────────────

  protected headerSave(): void {
    this.formRef?.triggerSubmit();
  }

  protected async onScheduleSave(dto: ICreateFlightScheduleDto): Promise<void> {
    const result = await this.store.upsertSchedule(dto);

    if (result.success && result.scheduleId) {
      this.isDirty.set(false);
      this.scheduleId.set(result.scheduleId);
      this.isEditMode.set(true);
      this._pushToast({
        id: _gid(),
        type: 'success',
        message: this.isEditMode()
          ? `Schedule #${result.scheduleId} has been updated.`
          : `Schedule #${result.scheduleId} has been created successfully.`,
      });
      this.store.clearSavedScheduleId();
    }
  }

  // ── Leg dialog ────────────────────────────────────────────────────────

  protected openAddLegDialog(): void {
    this.editLegTarget.set(null);
    this.legDialogError.set(null);
    this.legDialogOpen.set(true);
  }

  protected openEditLegDialog(leg: IFlightLegDefDto): void {
    this.editLegTarget.set(leg);
    this.legDialogError.set(null);
    this.legDialogOpen.set(true);
  }

  protected openEditLegDialogByDefId(legDefId: number): void {
    const leg = this.legs().find(l => l.legDefId === legDefId);
    if (leg) this.openEditLegDialog(leg);
  }

  protected closeLegDialog(): void {
    if (this.isLegSaving()) return;
    this.legDialogOpen.set(false);
    this.editLegTarget.set(null);
    this.legDialogError.set(null);
  }

  protected async onLegSave(dto: ICreateFlightLegDefDto): Promise<void> {
    const id = this.scheduleId();
    if (!id) {
      this.legDialogError.set('Save the master schedule first before adding flight legs.');
      return;
    }

    const result = await this.store.addNewLeg(id, dto);

    if (result.success) {
      this.legDialogOpen.set(false);
      this.editLegTarget.set(null);
      this.legDialogError.set(null);
      this._pushToast({ id: _gid(), type: 'success', message: `Leg ${dto.departureAirportIataCode} → ${dto.arrivalAirportIataCode} added.` });
    } else {
      this.legDialogError.set(result.error ?? 'Failed to add leg.');
    }
  }

  protected removeLeg(legDefId: number): void {
    this.store.removeLegFromCache(legDefId);
  }

  // ── Misc ──────────────────────────────────────────────────────────────

  protected onDirtyChange(dirty: boolean): void {
    this.isDirty.set(dirty);
  }

  protected dismissConfigError(): void {
    this.store.clearConfigError();
  }

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
    }, 4500);
    this._toastTimers.set(toast.id, t);
  }
}

function _gid(): string { return Math.random().toString(36).slice(2, 10); }