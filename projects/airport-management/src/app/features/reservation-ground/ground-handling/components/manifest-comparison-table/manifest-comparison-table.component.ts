
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { IManifestEntry } from '../../store/ground-handling.store';

export const MCT_ROW_HEIGHT = 40;
export const MCT_VIRTUAL_THRESHOLD = 50;

@Component({
  selector: 'aoms-manifest-comparison-table',
  standalone: true,
  imports: [CommonModule, ScrollingModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './manifest-comparison-table.component.html',
  styleUrl: './manifest-comparison-table.component.scss',
})
export class ManifestComparisonTableComponent {
  // ── Inputs ─────────────────────────────────────────────────────────────
  readonly entries = input.required<IManifestEntry[]>();
  readonly loading = input<boolean>(false);

  // ── Constants exposed to template ─────────────────────────────────────
  protected readonly rowHeight = MCT_ROW_HEIGHT;

  // ── Computed ───────────────────────────────────────────────────────────
  readonly useVirtualScroll = computed<boolean>(
    () => this.entries().length > MCT_VIRTUAL_THRESHOLD
  );

  readonly viewportHeight = computed<string>(() => {
    const count = this.entries().length;
    const maxRows = Math.min(count, 14);
    return `${maxRows * MCT_ROW_HEIGHT}px`;
  });

  readonly isEmpty = computed<boolean>(
    () => !this.loading() && this.entries().length === 0
  );

  // ── Helpers ────────────────────────────────────────────────────────────
  protected trackByPassengerId(_: number, e: IManifestEntry): number {
    return e.passengerId;
  }
}