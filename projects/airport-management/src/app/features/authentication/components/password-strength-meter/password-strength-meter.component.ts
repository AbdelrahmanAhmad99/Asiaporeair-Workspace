
import {
  Component, Input, computed, signal,
  ChangeDetectionStrategy, OnChanges, SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';

export type StrengthLevel = 'weak' | 'fair' | 'good' | 'strong';

interface StrengthResult {
  level: StrengthLevel;
  score: number;   // 0–4
  label: string;
  hint: string;
}

@Component({
  selector: 'app-password-strength-meter',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './password-strength-meter.component.html',
  styleUrls: ['./password-strength-meter.component.scss'],
})
export class PasswordStrengthMeterComponent implements OnChanges {

  @Input({ required: true }) password = '';

  readonly result = signal<StrengthResult>(this.evaluate(''));

  readonly segments = [0, 1, 2, 3] as const;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['password']) {
      this.result.set(this.evaluate(this.password));
    }
  }

  isSegmentActive(index: number): boolean {
    return index < this.result().score;
  }

  // ── Strength evaluation ───────────────────────────────────────────────────

  private evaluate(pw: string): StrengthResult {
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
    if (/\d/.test(pw)) score++;
    if (/[\W_]/.test(pw)) score++;

    // Cap at 4 for the 4-segment bar
    const capped = Math.min(Math.floor(score * 4 / 5), 4) as 0 | 1 | 2 | 3 | 4;

    const map: Record<number, StrengthResult> = {
      0: { level: 'weak', score: 1, label: 'Too Weak', hint: 'Use at least 8 characters.' },
      1: { level: 'weak', score: 1, label: 'Weak', hint: 'Add uppercase letters.' },
      2: { level: 'fair', score: 2, label: 'Fair', hint: 'Add numbers or symbols.' },
      3: { level: 'good', score: 3, label: 'Good', hint: 'One more symbol for strong.' },
      4: { level: 'strong', score: 4, label: 'Strong', hint: 'Excellent password.' },
    };

    return map[capped];
  }
}