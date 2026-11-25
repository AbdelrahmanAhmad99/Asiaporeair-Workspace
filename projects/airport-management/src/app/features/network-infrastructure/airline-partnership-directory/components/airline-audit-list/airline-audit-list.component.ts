
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  animate,
  query,
  stagger,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { IAirlineDto } from '@shared-core';
import { ReactivateActionButtonComponent } from '../reactivate-action-button/reactivate-action-button.component';

// ── Animations ────────────────────────────────────────────────────────────
const auditRowAnimation = trigger('auditRows', [
  transition('* => *', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateX(-8px)' }),
      stagger(22, [
        animate(
          '200ms cubic-bezier(0.22, 1, 0.36, 1)',
          style({ opacity: 1, transform: 'translateX(0)' })
        ),
      ]),
    ], { optional: true }),
    // Fade-out restored records before they fully leave the list
    query(':leave', [
      animate(
        '200ms ease',
        style({ opacity: 0, transform: 'translateX(8px)' })
      ),
    ], { optional: true }),
  ]),
]);

interface IAuditColumn {
  key: string;
  label: string;
  shimmerWidth: string;
  hideOnMd?: boolean;
  hideOnLg?: boolean;
}

@Component({
  selector: 'aoms-airline-audit-list',
  standalone: true,
  imports: [CommonModule, ReactivateActionButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [auditRowAnimation],
  templateUrl: './airline-audit-list.component.html',
  styleUrl: './airline-audit-list.component.scss',
})
export class AirlineAuditListComponent {
  // ── Signal Inputs ─────────────────────────────────────────────────────
  readonly records = input.required<IAirlineDto[]>();
  readonly activeSet = input<Set<string>>(new Set());
  readonly loading = input<boolean>(false);
  readonly restoringCode = input<string | null>(null);
  readonly errorIataCode = input<string | null>(null);

  // ── Output ────────────────────────────────────────────────────────────
  readonly onReactivate = output<string>();

  // ── Column definitions ─────────────────────────────────────────────────
  protected readonly columns: IAuditColumn[] = [
    { key: 'dot', label: '', shimmerWidth: '12px' },
    { key: 'iata', label: 'IATA', shimmerWidth: '48px' },
    { key: 'logo', label: '', shimmerWidth: '36px' },
    { key: 'name', label: 'Partner', shimmerWidth: '55%' },
    { key: 'callsign', label: 'Callsign', shimmerWidth: '42%', hideOnMd: true },
    { key: 'region', label: 'Region', shimmerWidth: '45%', hideOnLg: true },
    { key: 'status', label: 'Status', shimmerWidth: '56px' },
    { key: 'action', label: '', shimmerWidth: '72px' },
  ];

  protected readonly shimmerRows = Array(8).fill(null);

  // ── Derived helpers ───────────────────────────────────────────────────

  protected isActive(iataCode: string): boolean {
    return this.activeSet().has(iataCode);
  }

  protected isThisError(iataCode: string): boolean {
    return this.errorIataCode() === iataCode;
  }

  /** Logo initials: first 2 chars of first 2 words. */
  protected logoInitials(name: string): string {
    const words = name.trim().split(/\s+/);
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return words.slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }
}