// ============================================================================
// success-celebration.component.ts
// Asiaporeair | Gold Shimmer Burst — Entrance Celebration (2s auto-dismiss)
// Purely presentational, zero inputs needed.
// ============================================================================

import {
  Component, OnInit, OnDestroy,
  ChangeDetectionStrategy, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-success-celebration',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './success-celebration.component.html',
  styleUrl: './success-celebration.component.scss',
})
export class SuccessCelebrationComponent implements OnInit, OnDestroy {

  readonly visible = signal<boolean>(true);
  private dismissTimeout: ReturnType<typeof setTimeout> | null = null;

  /** 12 gold fleck particles in a circle pattern */
  readonly particles: Array<{ style: string }> = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * 360;
    const r = 46 + (i % 3) * 6;
    const x = Math.cos((angle * Math.PI) / 180) * r;
    const y = Math.sin((angle * Math.PI) / 180) * r;
    const size = 2 + (i % 3);
    return {
      style: `
                left: calc(50% + ${x}px);
                top: calc(50% + ${y}px);
                width: ${size}px;
                height: ${size}px;
                opacity: ${0.4 + (i % 4) * 0.15};
                animation: fleckPulse ${1.2 + (i % 4) * 0.3}s ${i * 0.08}s ease-in-out infinite alternate;
                transform: translate(-50%, -50%);
            `
    };
  });

  ngOnInit(): void {
    this.dismissTimeout = setTimeout(() => {
      this.visible.set(false);
    }, 2200);
  }

  ngOnDestroy(): void {
    if (this.dismissTimeout) clearTimeout(this.dismissTimeout);
  }
}