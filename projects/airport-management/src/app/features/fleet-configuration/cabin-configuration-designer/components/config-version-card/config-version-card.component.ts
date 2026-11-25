
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IConfigViewModel } from '../../store/cabin-designer.store';

@Component({
  selector: 'aoms-config-version-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './config-version-card.component.html',
  styleUrl: './config-version-card.component.scss',
})
export class ConfigVersionCardComponent {
  // ── Inputs ──────────────────────────────────────────────────────────────
  readonly config = input.required<IConfigViewModel>();
  readonly isDeleting = input<boolean>(false);

  // ── Outputs ─────────────────────────────────────────────────────────────
  readonly openWorkspace = output<number>();   // configId
  readonly deleteClicked = output<number>();   // configId
  readonly duplicateClicked = output<number>(); // configId

  // ── Computed helpers ──────────────────────────────────────────────────
  protected readonly hasClasses = computed(() =>
    this.config().cabinClasses.length > 0
  );

  protected readonly seatDisplay = computed(() => {
    const n = this.config().totalDerivedSeats || this.config().totalSeatsCount;
    return n > 0 ? n.toString() : '—';
  });

  /** Map variant → display label for the distribution bar tooltip. */
  protected variantColor(variant: string): string {
    const map: Record<string, string> = {
      first: '#B68F24',
      business: '#4B5563',
      premium: '#6B7280',
      economy: '#9CA3AF',
      other: '#D1D5DB',
    };
    return map[variant] ?? map['other'];
  }
}