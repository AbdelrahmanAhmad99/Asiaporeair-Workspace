
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { ScanningStatus, IScanResult } from '../../store/ground-handling.store';

@Component({
  selector: 'aoms-gate-feedback-panel',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './gate-feedback-panel.component.html',
  styleUrl: './gate-feedback-panel.component.scss',
})
export class GateFeedbackPanelComponent {
  // ── Inputs ─────────────────────────────────────────────────────────────
  readonly scanResult = input<IScanResult | null>(null);
  readonly scanningStatus = input<ScanningStatus>('Idle');
  readonly isScanning = input<boolean>(false);

  // ── Outputs ────────────────────────────────────────────────────────────
  readonly resetRequested = output<void>();

  // ── Computed theme helpers ────────────────────────────────────────────
  readonly panelTheme = computed<string>(() => {
    switch (this.scanningStatus()) {
      case 'Success': return 'success';
      case 'Warning': return 'warning';
      case 'Denied':
      case 'Error': return 'denied';
      case 'Scanning': return 'scanning';
      default: return 'idle';
    }
  });

  readonly headlineText = computed<string>(() => {
    const result = this.scanResult();
    if (result) return result.message;
    switch (this.scanningStatus()) {
      case 'Scanning': return 'SCANNING…';
      default: return 'GATE STANDBY';
    }
  });

  readonly showPassengerInfo = computed<boolean>(() =>
    !!this.scanResult() && this.scanningStatus() !== 'Idle'
  );

  readonly formattedTimestamp = computed<string>(() => {
    const ts = this.scanResult()?.timestamp;
    if (!ts) return '';
    return ts.toLocaleTimeString('en-GB', {
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
  });

  readonly sequenceLabel = computed<string>(() => {
    const seq = this.scanResult()?.sequenceNumber;
    if (!seq) return '';
    return `#${String(seq).padStart(3, '0')}`;
  });
}