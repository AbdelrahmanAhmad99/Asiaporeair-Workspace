// ============================================================================
// check-in-success.component.ts
// Asiaporeair | Step 3 — "Your Journey is Confirmed"
// Smart Component: reads activeBoardingPass from store, handles all actions.
// ============================================================================

import {
  Component, OnInit, OnDestroy,
  ChangeDetectionStrategy, inject, computed, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  trigger, transition, style, animate, query, stagger
} from '@angular/animations';

import { CheckInStore } from '../../../store/check-in.store';
import { CheckInStepperComponent } from '../../../check-in-search/components/check-in-stepper/check-in-stepper.component';
import { BoardingPassPreviewComponent } from '../../components/boarding-pass-preview/boarding-pass-preview.component';
import { ActionButtonsGroupComponent } from '../../components/action-buttons-group/action-buttons-group.component';
import { SuccessCelebrationComponent } from '../../components/success-celebration/success-celebration.component';

const PAGE_ANIMATIONS = [
  trigger('heroFade', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateY(-12px)' }),
      animate('480ms cubic-bezier(0.22, 1, 0.36, 1)',
        style({ opacity: 1, transform: 'translateY(0)' }))
    ])
  ]),
  trigger('contentReveal', [
    transition(':enter', [
      query('.reveal-item', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        stagger(120, [
          animate('440ms cubic-bezier(0.22, 1, 0.36, 1)',
            style({ opacity: 1, transform: 'translateY(0)' }))
        ])
      ], { optional: true })
    ])
  ]),
  trigger('fadeIn', [
    transition(':enter', [
      style({ opacity: 0 }),
      animate('300ms ease', style({ opacity: 1 }))
    ])
  ])
];

@Component({
  selector: 'app-check-in-success',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    CheckInStepperComponent,
    BoardingPassPreviewComponent,
    ActionButtonsGroupComponent,
    SuccessCelebrationComponent
  ],
  animations: PAGE_ANIMATIONS,
  templateUrl: './check-in-success.component.html',
  styleUrls: ['./check-in-success.component.scss']
})
export class CheckInSuccessComponent implements OnInit, OnDestroy {

  // ── DI ────────────────────────────────────────────────────────────────────
  readonly store = inject(CheckInStore);
  readonly router = inject(Router);

  // ── Store signal aliases ──────────────────────────────────────────────────
  readonly checkInStep = this.store.checkInStep;
  readonly boardingPass = this.store.activeBoardingPass;
  readonly allPasses = this.store.generatedBoardingPasses;
  readonly currentBooking = this.store.currentBooking;

  // ── Template helpers ──────────────────────────────────────────────────────
  /** Used by @for in the hero to render ambient gold particles. */
  readonly particles = Array.from({ length: 14 });

  // ── Local UI state ────────────────────────────────────────────────────────
  readonly isDownloading = signal<boolean>(false);
  readonly isSendingEmail = signal<boolean>(false);
  readonly showAllPasses = signal<boolean>(false);

  /** Index of the currently displayed pass (when multiple passengers). */
  readonly activePassIndex = signal<number>(0);

  /** The pass currently shown in the boarding-pass-preview. */
  readonly displayedPass = computed(() => {
    const passes = this.allPasses();
    if (passes.length === 0) return this.boardingPass();
    return passes[this.activePassIndex()] ?? this.boardingPass();
  });

  /** Whether this booking had multiple passengers checked in. */
  readonly hasMultiplePasses = computed(() => this.allPasses().length > 1);

  /** True when no boarding pass is in the store (direct URL navigation). */
  readonly isMissingPass = computed(() => !this.boardingPass() && this.allPasses().length === 0);

  /** Concierge greeting derived from passenger name. */
  readonly welcomeGreeting = computed((): string => {
    const pass = this.displayedPass();
    if (!pass) return 'Welcome Aboard';
    const firstName = pass.passengerName.split(' ')[0] ?? '';
    return `Welcome Aboard, ${firstName}`;
  });

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    // Guard: no boarding pass means the user landed here directly
    if (this.isMissingPass()) {
      this.router.navigate(['/check-in/search']);
      return;
    }
    // Ensure stepper shows Step 3
    if (this.store.checkInStep() < 3) {
      this.store.checkInStep.set(3);
    }
  }

  ngOnDestroy(): void {
    // State is intentionally preserved until the user explicitly navigates home
    // so they can return to this page within the same session.
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  /**
   * Triggers the browser print dialog.
   * The boarding-pass-preview has @media print CSS to render
   * a clean, stripped-down card — no header, no buttons, no backgrounds.
   */
  onDownloadPdf(): void {
    this.isDownloading.set(true);

    // Give the UI a frame to reflect the loading state before blocking print
    setTimeout(() => {
      window.print();
      this.isDownloading.set(false);
    }, 120);
  }

  onSendEmail(emailAddress: string): void {
    this.isSendingEmail.set(true);

    // In a real implementation: inject an EmailService and call it here.
    // For now, simulate an async operation.
    setTimeout(() => {
      console.log(`[CheckInSuccess] Boarding pass email requested → ${emailAddress}`);
      this.isSendingEmail.set(false);
    }, 1400);
  }

  /** Returns to the passenger selection page to check in additional travellers. */
  onCheckInAnother(): void {
    this.store.resetGenerationErrors();
    this.router.navigate(['/check-in/passenger-selection']);
  }

  /**
   * Returns to the home page and performs a full store reset.
   * This prevents stale boarding pass data from persisting if the user
   * starts a new check-in flow later.
   */
  onReturnHome(): void {
    this.store.resetStore();
    this.router.navigate(['/']);
  }

  /** Switches the boarding-pass-preview to a different passenger's pass. */
  selectPass(index: number): void {
    this.activePassIndex.set(index);
  }
}