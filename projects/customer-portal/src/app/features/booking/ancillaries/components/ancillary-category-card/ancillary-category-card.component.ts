
import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ancillary-category-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ancillary-category-card.component.html',
  styleUrls: ['./ancillary-category-card.component.scss']
})
export class AncillaryCategoryCardComponent {

  // ── Inputs ────────────────────────────────────────────────────────────────
  readonly categoryKey = input.required<string>();
  readonly label = input.required<string>();
  readonly description = input.required<string>();
  readonly iconKey = input.required<string>();
  readonly productCount = input<number>(0);
  readonly selectedCount = input<number>(0);
  readonly isExpanded = input<boolean>(false);

  // ── Outputs ───────────────────────────────────────────────────────────────
  readonly cardClick = output<string>();

  onCardClick(): void {
    this.cardClick.emit(this.categoryKey());
  }
}