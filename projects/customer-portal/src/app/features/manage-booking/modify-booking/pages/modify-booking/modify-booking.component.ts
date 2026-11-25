// ============================================================================
// modify-booking.component.ts
// Asiaporeair | "Update Your Suite Manifest" — Modify Booking Smart Page
// ============================================================================

import {
  Component, OnInit, OnDestroy,
  ChangeDetectionStrategy, inject, signal, computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import {
  trigger, transition, style, animate, query, stagger
} from '@angular/animations';
import { Subject, takeUntil } from 'rxjs';
import { finalize, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

import { ManageBookingStore, IPassengerEditDraft } from '../../../store/manage-booking.store';
import { BookingService } from '@shared-core';
import { PassengersService } from '@shared-core';
import { IBookingDetailDto } from '@shared-core';
import { IUpdatePassengerDto } from '@shared-core';

import { PassengerEditFormComponent } from '../../components/passenger-edit-form/passenger-edit-form.component';
import { ModificationSummaryCardComponent } from '../../components/modification-summary-card/modification-summary-card.component';
import { ActionConfirmationModalComponent } from '../../components/action-confirmation-modal/action-confirmation-modal.component';

// ── Animations ────────────────────────────────────────────────────────────────
const MODIFY_ANIMATIONS = [
  trigger('pageEnter', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateY(16px)' }),
      animate('440ms cubic-bezier(0.22,1,0.36,1)',
        style({ opacity: 1, transform: 'translateY(0)' }))
    ])
  ]),
  trigger('formsStagger', [
    transition(':enter', [
      query('.form-stagger', [
        style({ opacity: 0, transform: 'translateX(-20px)' }),
        stagger(80, [
          animate('400ms cubic-bezier(0.22,1,0.36,1)',
            style({ opacity: 1, transform: 'translateX(0)' }))
        ])
      ], { optional: true })
    ])
  ]),
  trigger('fadeSlide', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateY(8px)' }),
      animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
    ])
  ]),
  trigger('fadeIn', [
    transition(':enter', [
      style({ opacity: 0 }),
      animate('240ms ease-out', style({ opacity: 1 }))
    ]),
    transition(':leave', [
      animate('180ms ease-in', style({ opacity: 0 }))
    ])
  ])
];

export type ModifyFlowState = 'loading' | 'editing' | 'confirming' | 'saving' | 'success' | 'error';

@Component({
  selector: 'app-modify-booking',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    PassengerEditFormComponent,
    ModificationSummaryCardComponent,
    ActionConfirmationModalComponent
  ],
  animations: MODIFY_ANIMATIONS,
  templateUrl: './modify-booking.component.html',
  styleUrls: ['./modify-booking.component.scss']
})
export class ModifyBookingComponent implements OnInit, OnDestroy {

  // ── DI ────────────────────────────────────────────────────────────────────
  private readonly store = inject(ManageBookingStore);
  private readonly bookingService = inject(BookingService);
  private readonly passengersService = inject(PassengersService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroy$ = new Subject<void>();

  // ── Store aliases ─────────────────────────────────────────────────────────
  readonly detail = this.store.selectedBookingDetails;
  readonly passengerDrafts = this.store.passengerDrafts;
  readonly isUpdating = this.store.isUpdating;
  readonly updateSuccess = this.store.updateSuccess;
  readonly modifyError = this.store.modifyError;
  readonly hasUnsaved = this.store.hasUnsavedChanges;
  readonly allSaved = this.store.allDraftsSaved;

  // ── Local UI state ────────────────────────────────────────────────────────
  readonly flowState = signal<ModifyFlowState>('loading');
  readonly activePassengerId = signal<number | null>(null);
  readonly confirmModalOpen = signal<boolean>(false);
  /** Which passengerId is pending save-confirmation. */
  readonly pendingConfirmPaxId = signal<number | null>(null);
  /** Holds the dto that will be sent if the user confirms. */
  readonly pendingUpdateDto = signal<IUpdatePassengerDto | null>(null);

  // ── Route param ───────────────────────────────────────────────────────────
  private bookingRef: number | string = 0;

  // ── Computed ──────────────────────────────────────────────────────────────

  readonly pageTitle = computed(() => {
    const d = this.detail();
    return d ? `Update Suite Manifest — ${d.bookingReference}` : 'Update Your Suite Manifest';
  });

  readonly pnrDisplay = computed(() =>
    this.detail()?.bookingReference ?? ''
  );

  readonly activePassengerDraft = computed((): IPassengerEditDraft | null => {
    const id = this.activePassengerId();
    return id != null
      ? (this.passengerDrafts().find(d => d.passengerId === id) ?? null)
      : null;
  });

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    const rawId = this.route.snapshot.paramMap.get('id') ?? '';
    this.bookingRef = isNaN(Number(rawId)) ? rawId : Number(rawId);
    this.store.resetModifyState();
    this.loadBookingForEdit();
  }

  ngOnDestroy(): void {
    this.store.resetModifyState();
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Private Loaders ───────────────────────────────────────────────────────

  private loadBookingForEdit(): void {
    this.flowState.set('loading');

    // Re-use cached detail if already loaded for the same booking
    const cached = this.detail();
    if (cached && (cached.bookingId === Number(this.bookingRef) ||
      cached.bookingReference === this.bookingRef)) {
      this.initializeDrafts(cached);
      return;
    }

    const call$ = typeof this.bookingRef === 'number'
      ? this.bookingService.getBookingDetails(this.bookingRef)
      : this.bookingService.getBookingByReference(this.bookingRef as string);

    call$
      .pipe(
        takeUntil(this.destroy$),
        catchError(err => {
          this.store.setModifyError(this.resolveError(err));
          this.flowState.set('error');
          return of(null);
        })
      )
      .subscribe(detail => {
        if (detail) {
          this.store.setBookingDetails(detail);
          this.initializeDrafts(detail);
        }
      });
  }

  private initializeDrafts(detail: IBookingDetailDto): void {
    this.store.initPassengerDrafts(detail.passengers);
    // Set first passenger active by default
    if (detail.passengers.length > 0) {
      this.activePassengerId.set(detail.passengers[0].passengerId);
    }
    this.flowState.set('editing');
  }

  private resolveError(err: any): string {
    switch (err?.status) {
      case 401: return 'Please sign in to modify this booking.';
      case 403: return 'You do not have permission to modify this booking.';
      case 404: return 'Booking not found. Please check your reference.';
      default: return 'Unable to load booking. Please try again.';
    }
  }

  // ── Public Actions ────────────────────────────────────────────────────────

  onBack(): void {
    this.router.navigate(['/manage-booking/booking', this.bookingRef]);
  }

  onSelectPassenger(passengerId: number): void {
    this.activePassengerId.set(passengerId);
  }

  /**
   * Called by passenger-edit-form when the user submits changes.
   * Opens the confirmation modal before sending to the API.
   */
  onRequestSave(event: { passengerId: number; dto: IUpdatePassengerDto }): void {
    this.store.updateDraft(event.passengerId, {
      firstName: event.dto.firstName,
      lastName: event.dto.lastName,
      dateOfBirth: event.dto.dateOfBirth ?? null,
      passportNumber: event.dto.passportNumber ?? null
    });
    this.pendingConfirmPaxId.set(event.passengerId);
    this.pendingUpdateDto.set(event.dto);
    this.confirmModalOpen.set(true);
  }

  /** User cancelled the confirmation — no API call. */
  onCancelConfirm(): void {
    this.confirmModalOpen.set(false);
    this.pendingConfirmPaxId.set(null);
    this.pendingUpdateDto.set(null);
  }

  /** User confirmed — proceed with API call. */
  onConfirmSave(): void {
    const passengerId = this.pendingConfirmPaxId();
    const dto = this.pendingUpdateDto();
    if (passengerId == null || !dto) return;

    this.confirmModalOpen.set(false);
    this.pendingConfirmPaxId.set(null);
    this.pendingUpdateDto.set(null);

    this.executePassengerUpdate(passengerId, dto);
  }

  private executePassengerUpdate(passengerId: number, dto: IUpdatePassengerDto): void {
    this.store.setDraftSaving(passengerId, true);
    this.store.setIsUpdating(true);
    this.store.setModifyError(null);

    this.passengersService
      .updateSavedPassenger(passengerId, dto)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.store.setIsUpdating(false)),
        catchError(err => {
          this.store.clearDraftSaving(passengerId);
          this.store.setModifyError(this.resolveSaveError(err));
          return of(null);
        })
      )
      .subscribe(updated => {
        if (updated) {
          this.store.markDraftSaved(passengerId);
          // Auto-advance to next passenger with unsaved changes
          this.advanceToNextDirtyPassenger(passengerId);
        }
      });
  }

  /** After saving, focus the next passenger that still has unsaved changes. */
  private advanceToNextDirtyPassenger(savedPassengerId: number): void {
    const next = this.passengerDrafts().find(
      d => d.passengerId !== savedPassengerId && d.isDirty
    );
    if (next) this.activePassengerId.set(next.passengerId);
  }

  private resolveSaveError(err: any): string {
    switch (err?.status) {
      case 400: return 'Please check your details — some fields contain invalid values.';
      case 403: return 'You cannot modify this passenger at this time.';
      case 404: return 'Passenger record not found.';
      default: return 'Unable to save changes. Please try again.';
    }
  }

  onSaveAllAndReturn(): void {
    this.router.navigate(['/manage-booking/booking', this.bookingRef]);
  }

  onDismissSuccess(): void {
    this.store.updateSuccess.set(false);
  }

  // ── Template helpers ──────────────────────────────────────────────────────

  trackByDraft(_: number, d: IPassengerEditDraft): number { return d.passengerId; }
}