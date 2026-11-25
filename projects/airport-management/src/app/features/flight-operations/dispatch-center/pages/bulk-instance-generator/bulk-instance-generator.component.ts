
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
import { BulkGenerationFormComponent } from '../../components/bulk-generation-form/bulk-generation-form.component';
import { ScheduleReferenceGridComponent } from '../../components/schedule-reference-grid/schedule-reference-grid.component';
import { IGenerateInstancesRequestDto, IGenerationReportDto } from '@shared-core';

@Component({
  selector: 'aoms-bulk-instance-generator',
  standalone: true,
  imports: [
    CommonModule,
    BulkGenerationFormComponent,
    ScheduleReferenceGridComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './bulk-instance-generator.component.html',
  styleUrl: './bulk-instance-generator.component.scss',
})
export class BulkInstanceGeneratorComponent implements OnInit, OnDestroy {
  protected readonly store = inject(FlightDispatchStore);
  private readonly router = inject(Router);

  // ── Store passthrough ─────────────────────────────────────────────────
  protected readonly schedules = this.store.masterSchedules;
  protected readonly airlines = this.store.airlineList;
  protected readonly bulkRefLoading = this.store.bulkRefLoading;
  protected readonly isGenerating = this.store.isGenerating;
  protected readonly generationError = this.store.generationError;
  protected readonly generationSuccess = this.store.generationSuccess;
  protected readonly validityWindow = this.store.scheduleValidityWindow;
  protected readonly isAnyLoading = computed(() =>
    this.store.bulkRefLoading() || this.store.isGenerating()
  );

  // ── Error modal state ─────────────────────────────────────────────────
  protected readonly errorModalOpen = signal<boolean>(false);

  // ── Success report modal state ────────────────────────────────────────
  protected readonly successModalOpen = signal<boolean>(false);
  protected readonly lastReport = signal<IGenerationReportDto | null>(null);

  // ─────────────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.store.clearGenerationError();
    this.store.loadBulkReferenceData();
  }

  ngOnDestroy(): void {
    this.store.clearGenerationError();
    this.store.clearGenerationSuccess();
  }

  // ── Navigation ────────────────────────────────────────────────────────

  protected goToControlRoom(): void {
    this.router.navigate([
      'aoms/flight-operations/dispatch-center/flight-instance-control-room',
    ]);
  }

  protected refreshRefData(): void {
    this.store.invalidateBulkRefData();
    this.store.loadBulkReferenceData();
  }

  private lastPayload: IGenerateInstancesRequestDto | null = null;

  // ── Generation ────────────────────────────────────────────────────────

  protected async onGenerate(payload: IGenerateInstancesRequestDto): Promise<void> {
    this.lastPayload = payload;
    const result = await this.store.generateBulk(payload);

    if (result.success && result.report) {
      this.lastReport.set(result.report);
      this.successModalOpen.set(true);
    } else if (!result.success) {
      // Error already set in store.generationError; open the error modal
      this.errorModalOpen.set(true);
    }
  }

  // ── Modals ────────────────────────────────────────────────────────────

  protected closeErrorModal(): void {
    this.errorModalOpen.set(false);
    this.store.clearGenerationError();
  }

  protected closeSuccessModal(): void {
    this.successModalOpen.set(false);

    // Update Control Room filters to show the newly generated period
    if (this.lastPayload) {
      this.store.updateSearchFilters({
        dateFrom: typeof this.lastPayload.startDate === 'string'
          ? this.lastPayload.startDate
          : (this.lastPayload.startDate as Date).toISOString().split('T')[0],
        dateTo: typeof this.lastPayload.endDate === 'string'
          ? this.lastPayload.endDate
          : (this.lastPayload.endDate as Date).toISOString().split('T')[0],
        airlineIataCode: this.lastPayload.airlineIataCode
      } as any);
    }

    this.store.clearGenerationSuccess();
    this.lastReport.set(null);
    // Navigate to Control Room so supervisor can review the generated instances
    this.goToControlRoom();
  }

  protected viewInControlRoom(): void {
    this.closeSuccessModal();
  }
}