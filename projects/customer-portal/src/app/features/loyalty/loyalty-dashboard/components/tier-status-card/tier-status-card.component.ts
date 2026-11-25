// ============================================================================
// tier-status-card.component.ts
// Asiaporeair | Dumb Component — Current Tier Status Card
//
// Accepts:
//   tier        → e.g. "Member" | "Silver" | "Gold" | "Platinum"
//   cardNumber  → Formatted FF card number
//   isActive    → Account active flag
//   benefits    → Array of benefit strings for current tier
//   isLoading   → Drives the shimmer skeleton
// ============================================================================
import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tier-status-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tier-status-card.component.html',
  styleUrl: './tier-status-card.component.scss',
})
export class TierStatusCardComponent {

  // ── Inputs ────────────────────────────────────────────────────────────────
  readonly tier      = input<string>('Member');
  readonly cardNumber = input<string>('ASP-XXXXXXXX');
  readonly isActive  = input<boolean>(true);
  readonly benefits  = input<string[]>([]);
  readonly isLoading = input<boolean>(false);

  // ── Derived helpers ───────────────────────────────────────────────────────

  /** CSS modifier class based on tier name — drives gradient variant. */
  get tierClass(): string {
    return `tier--${(this.tier() ?? 'member').toLowerCase()}`;
  }

  /** Tier icon character (thin SVG-less fallback using unicode glyphs). */
  get tierIcon(): string {
    switch ((this.tier() ?? '').toLowerCase()) {
      case 'platinum': return '◈';
      case 'gold':     return '◆';
      case 'silver':   return '◇';
      default:         return '○';
    }
  }

  /** Human-readable label with leading "Asiaporeair" branding. */
  get tierLabel(): string {
    return `Asiaporeair ${this.tier()} Member`;
  }
}
