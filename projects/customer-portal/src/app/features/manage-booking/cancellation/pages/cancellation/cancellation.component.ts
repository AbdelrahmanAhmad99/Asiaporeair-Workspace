// ============================================================================
// cancellation.component.ts
// Asiaporeair | "Initiate Refund Process" — Cancellation Smart Page
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

import {
    ManageBookingStore, CancellationStatus
} from '../../../store/manage-booking.store';
import { BookingService } from '@shared-core';
import { IBookingDetailDto } from '@shared-core';

import { RefundPolicyPanelComponent } from '../../components/refund-policy-panel/refund-policy-panel.component';
import { CancellationReasonFormComponent } from '../../components/cancellation-reason-form/cancellation-reason-form.component';
import { CancellationSummaryCardComponent } from '../../components/cancellation-summary-card/cancellation-summary-card.component';
import { CancellationModalComponent } from '../../components/cancellation-modal/cancellation-modal.component';

// ── Animations ────────────────────────────────────────────────────────────────
const CANCEL_ANIMATIONS = [
    trigger('pageEnter', [
        transition(':enter', [
            style({ opacity: 0, transform: 'translateY(16px)' }),
            animate('420ms cubic-bezier(0.22,1,0.36,1)',
                style({ opacity: 1, transform: 'translateY(0)' }))
        ])
    ]),
    trigger('sectionsStagger', [
        transition(':enter', [
            query('.stagger-section', [
                style({ opacity: 0, transform: 'translateY(20px)' }),
                stagger(90, [
                    animate('400ms cubic-bezier(0.22,1,0.36,1)',
                        style({ opacity: 1, transform: 'translateY(0)' }))
                ])
            ], { optional: true })
        ])
    ]),
    trigger('fadeIn', [
        transition(':enter', [
            style({ opacity: 0 }),
            animate('260ms ease-out', style({ opacity: 1 }))
        ]),
        transition(':leave', [
            animate('180ms ease-in', style({ opacity: 0 }))
        ])
    ]),
    trigger('successPop', [
        transition(':enter', [
            style({ opacity: 0, transform: 'scale(0.85) translateY(-10px)' }),
            animate('500ms cubic-bezier(0.22,1,0.36,1)',
                style({ opacity: 1, transform: 'scale(1) translateY(0)' }))
        ])
    ])
];

@Component({
    selector: 'app-cancellation',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        RouterModule,
        RefundPolicyPanelComponent,
        CancellationReasonFormComponent,
        CancellationSummaryCardComponent,
        CancellationModalComponent
    ],
    animations: CANCEL_ANIMATIONS,
    templateUrl: './cancellation.component.html',
    styleUrls: ['./cancellation.component.scss']
})
export class CancellationComponent implements OnInit, OnDestroy {

    // ── DI ────────────────────────────────────────────────────────────────────
    private readonly store = inject(ManageBookingStore);
    private readonly bookingService = inject(BookingService);
    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);
    private readonly destroy$ = new Subject<void>();

    // ── Store aliases ─────────────────────────────────────────────────────────
    readonly detail = this.store.selectedBookingDetails;
    readonly cancellationStatus = this.store.cancellationStatus;
    readonly cancellationError = this.store.cancellationError;
    readonly isCancelling = this.store.isCancelling;
    readonly cancelSucceeded = this.store.cancelSucceeded;
    readonly cancelFailed = this.store.cancelFailed;

    // ── Local UI state ────────────────────────────────────────────────────────
    readonly isLoadingDetail = signal<boolean>(false);
    readonly loadError = signal<string | null>(null);
    readonly modalOpen = signal<boolean>(false);
    /** The reason text the user typed/selected — staged here before modal confirms. */
    readonly pendingReason = signal<string>('');

    // ── Route param ───────────────────────────────────────────────────────────
    private bookingRef: number | string = 0;

    // ── Computed ──────────────────────────────────────────────────────────────

    readonly pnrDisplay = computed(() =>
        this.detail()?.bookingReference ?? String(this.bookingRef)
    );

    readonly isReady = computed(() =>
        !!this.detail() && !this.isLoadingDetail()
    );

    readonly canProceed = computed(() =>
        this.pendingReason().trim().length >= 10 &&
        this.cancellationStatus() === 'idle'
    );

    readonly totalRefundable = computed(() =>
        this.detail()?.totalPrice ?? 0
    );

    // ── Lifecycle ─────────────────────────────────────────────────────────────

    ngOnInit(): void {
        const rawId = this.route.snapshot.paramMap.get('id') ?? '';
        this.bookingRef = isNaN(Number(rawId)) ? rawId : Number(rawId);
        this.store.resetCancellationState();
        this.ensureBookingDetail();
    }

    ngOnDestroy(): void {
        this.store.resetCancellationState();
        this.destroy$.next();
        this.destroy$.complete();
    }

    // ── Private Loaders ───────────────────────────────────────────────────────

    private ensureBookingDetail(): void {
        const cached = this.detail();
        if (cached && (cached.bookingId === Number(this.bookingRef) ||
            cached.bookingReference === this.bookingRef)) {
            return; // Already loaded — no second API call
        }

        this.isLoadingDetail.set(true);
        this.loadError.set(null);

        const call$ = typeof this.bookingRef === 'number'
            ? this.bookingService.getBookingDetails(this.bookingRef)
            : this.bookingService.getBookingByReference(this.bookingRef as string);

        call$
            .pipe(
                takeUntil(this.destroy$),
                finalize(() => this.isLoadingDetail.set(false)),
                catchError(err => {
                    this.loadError.set(this.resolveLoadError(err));
                    return of(null);
                })
            )
            .subscribe(detail => {
                if (detail) this.store.setBookingDetails(detail);
            });
    }

    private resolveLoadError(err: any): string {
        switch (err?.status) {
            case 401: return 'Please sign in to continue.';
            case 403: return 'You do not have permission to cancel this booking.';
            case 404: return 'Booking not found. Please check your reference.';
            default: return 'Unable to load booking. Please try again.';
        }
    }

    private resolveCancelError(err: any): string {
        switch (err?.status) {
            case 400: return 'This booking cannot be cancelled at this time. Please contact our concierge.';
            case 403: return 'Cancellation is not permitted for this booking status.';
            case 404: return 'Booking not found. It may have already been cancelled.';
            case 409: return 'A cancellation request is already being processed for this booking.';
            default: return 'We were unable to process your cancellation. Please try again or contact support.';
        }
    }

    // ── Public Actions ────────────────────────────────────────────────────────

    onBack(): void {
        this.router.navigate(['/manage-booking/booking', this.bookingRef]);
    }

    onReasonChange(reason: string): void {
        this.pendingReason.set(reason);
        this.store.setCancellationError(null);
    }

    /** User clicked "Request Journey Termination" — opens confirmation modal. */
    onRequestCancellation(): void {
        if (!this.canProceed()) return;
        this.modalOpen.set(true);
    }

    onDismissModal(): void {
        this.modalOpen.set(false);
    }

    /** User confirmed in the modal — execute API call. */
    onConfirmCancellation(): void {
        const d = this.detail();
        if (!d || !this.canProceed()) return;

        this.modalOpen.set(false);
        this.store.setCancellationStatus('pending');
        this.store.setCancellationError(null);

        this.bookingService
            .cancelBooking(d.bookingId, this.pendingReason().trim())
            .pipe(
                takeUntil(this.destroy$),
                catchError(err => {
                    this.store.setCancellationStatus('error');
                    this.store.setCancellationError(this.resolveCancelError(err));
                    return of(false);
                })
            )
            .subscribe(success => {
                if (success) {
                    this.store.setCancellationStatus('success');
                    this.store.markBookingCancelledInList(d.bookingReference);
                    // Redirect after 2.8s to let the success state animate fully
                    setTimeout(() => {
                        this.router.navigate(['/manage-booking/booking', this.bookingRef]);
                    }, 2800);
                }
            });
    }

    onRetry(): void {
        this.store.resetCancellationState();
    }

    // ── Template Helpers ──────────────────────────────────────────────────────

    formatPrice(n: number): string {
        return n.toLocaleString('en-US', { minimumFractionDigits: 2 });
    }
}