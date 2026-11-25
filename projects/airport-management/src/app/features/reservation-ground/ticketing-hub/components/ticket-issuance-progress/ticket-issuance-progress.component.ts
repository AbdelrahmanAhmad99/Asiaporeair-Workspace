
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  IssuanceStatus,
  ISSUANCE_STAGES,
} from '../../store/ticketing.store';

// Human-readable label map for each pipeline stage
const STAGE_LABELS: Record<IssuanceStatus, string> = {
  Idle: 'Awaiting Command',
  VerifyingPayment: 'Verifying Payment',
  GeneratingDocuments: 'Generating Documents',
  SecuringDigitalSeal: 'Securing Digital Seal',
  Finalizing: 'Finalizing Records',
  Completed: 'Issuance Complete',
  Failed: 'Issuance Failed',
};

const STAGE_DESCRIPTIONS: Record<IssuanceStatus, string> = {
  Idle: 'Ready to begin ticket generation.',
  VerifyingPayment: 'Confirming payment clearance with the financial gateway…',
  GeneratingDocuments: 'Rendering legal e-ticket documents for all passengers…',
  SecuringDigitalSeal: 'Applying cryptographic signature and barcode seal…',
  Finalizing: 'Archiving records and notifying the check-in system…',
  Completed: 'All tickets issued and stored in the reservation system.',
  Failed: 'An error occurred during the issuance pipeline.',
};

export interface IProgressStage {
  id: IssuanceStatus;
  label: string;
  stageState: 'completed' | 'active' | 'pending' | 'error';
}

@Component({
  selector: 'aoms-ticket-issuance-progress',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ticket-issuance-progress.component.html',
  styleUrl: './ticket-issuance-progress.component.scss',
})
export class TicketIssuanceProgressComponent {
  // ── Inputs ─────────────────────────────────────────────────────────────
  readonly status = input.required<IssuanceStatus>();
  readonly overallProgress = input<number>(0);
  readonly stageIndex = input<number>(-1);
  readonly error = input<string | null>(null);

  // ── Computed ───────────────────────────────────────────────────────────
  readonly currentLabel = computed<string>(
    () => STAGE_LABELS[this.status()] ?? 'Processing…'
  );

  readonly currentDescription = computed<string>(
    () => STAGE_DESCRIPTIONS[this.status()] ?? ''
  );

  readonly isComplete = computed<boolean>(() => this.status() === 'Completed');
  readonly isFailed = computed<boolean>(() => this.status() === 'Failed');
  readonly isActive = computed<boolean>(() =>
    ISSUANCE_STAGES.includes(this.status() as IssuanceStatus)
  );

  readonly stages = computed<IProgressStage[]>(() => {
    const currentIdx = this.stageIndex();
    const failed = this.isFailed();
    const completed = this.isComplete();

    return ISSUANCE_STAGES.map((id, i): IProgressStage => {
      let stageState: IProgressStage['stageState'];

      if (failed && i === currentIdx) {
        stageState = 'error';
      } else if (completed || i < currentIdx) {
        stageState = 'completed';
      } else if (i === currentIdx) {
        stageState = 'active';
      } else {
        stageState = 'pending';
      }

      return { id, label: STAGE_LABELS[id], stageState };
    });
  });

  /** Progress bar fill: 100% on complete, 0% on failed, otherwise interpolated. */
  readonly progressBarWidth = computed<number>(() => {
    if (this.isComplete()) return 100;
    if (this.isFailed()) return this.overallProgress();
    return this.overallProgress();
  });
}