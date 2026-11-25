
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IRegistrationPayload } from '../../store/loyalty-intelligence.store';

export const REGISTRATION_TIERS = ['Classic', 'Silver', 'Gold'] as const;

// Card number prefix per Asiaporeair KrisFlyer-inspired numbering
const CARD_PREFIX = 'APA';

@Component({
  selector: 'aoms-account-registration-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './account-registration-form.component.html',
  styleUrl: './account-registration-form.component.scss',
})
export class AccountRegistrationFormComponent {
  // ── Inputs ─────────────────────────────────────────────────────────────
  readonly isProcessing = input<boolean>(false);

  // ── Outputs ────────────────────────────────────────────────────────────
  readonly formSubmitted = output<IRegistrationPayload>();

  // ── Form fields ────────────────────────────────────────────────────────
  protected readonly userIdInput = signal<string>('');
  protected readonly fullNameInput = signal<string>('');
  protected readonly level = signal<string>('Classic');
  protected readonly cardSuffix = signal<string>('');
  protected readonly initialPoints = signal<string>('');
  protected readonly welcomeOptIn = signal<boolean>(true);

  /** Touched flags — luxury real-time validation only shows after interaction */
  protected readonly userIdTouched = signal<boolean>(false);
  protected readonly nameTouched = signal<boolean>(false);
  protected readonly cardTouched = signal<boolean>(false);

  protected readonly tiers = REGISTRATION_TIERS;

  // ── Computed validation ────────────────────────────────────────────────

  readonly userIdValid = computed<boolean>(() => {
    const id = parseInt(this.userIdInput(), 10);
    return !!id && id > 0;
  });

  readonly nameValid = computed<boolean>(
    () => this.fullNameInput().trim().length >= 2
  );

  readonly cardSuffixValid = computed<boolean>(
    () => /^\d{6,9}$/.test(this.cardSuffix().trim())
  );

  readonly fullCardNumber = computed<string>(() => {
    const suffix = this.cardSuffix().trim();
    return suffix ? `${CARD_PREFIX}-${suffix}` : `${CARD_PREFIX}-XXXXXXXX`;
  });

  readonly initialPointsValue = computed<number>(() => {
    const n = parseInt(this.initialPoints(), 10);
    return isNaN(n) || n < 0 ? 0 : n;
  });

  readonly canSubmit = computed<boolean>(() =>
    this.userIdValid() &&
    this.nameValid() &&
    this.cardSuffixValid() &&
    !this.isProcessing()
  );

  readonly showUserIdError = computed<boolean>(() => this.userIdTouched() && !this.userIdValid());
  readonly showNameError = computed<boolean>(() => this.nameTouched() && !this.nameValid());
  readonly showCardError = computed<boolean>(() => this.cardTouched() && this.cardSuffix().length > 0 && !this.cardSuffixValid());

  // ── Handlers ───────────────────────────────────────────────────────────

  protected onUserIdInput(val: string): void {
    this.userIdInput.set(val);
    this.userIdTouched.set(true);
  }

  protected onFullNameInput(val: string): void {
    this.fullNameInput.set(val);
    this.nameTouched.set(true);
  }

  protected onCardSuffixInput(val: string): void {
    // Only allow digits
    this.cardSuffix.set(val.replace(/\D/g, ''));
    this.cardTouched.set(true);
  }

  protected onLevelChange(val: string): void {
    this.level.set(val);
  }

  protected onInitialPointsInput(val: string): void {
    this.initialPoints.set(val);
  }

  protected onWelcomeOptInToggle(): void {
    this.welcomeOptIn.update(v => !v);
  }

  protected onSubmit(): void {
    this.userIdTouched.set(true);
    this.nameTouched.set(true);
    this.cardTouched.set(true);

    if (!this.canSubmit()) return;

    this.formSubmitted.emit({
      userId: parseInt(this.userIdInput(), 10),
      fullNamePreview: this.fullNameInput().trim(),
      cardNumber: this.fullCardNumber(),
      level: this.level(),
      initialAwardPoints: this.initialPointsValue(),
      welcomeMessageOptIn: this.welcomeOptIn(),
    });
  }

  protected onGenerateCardSuffix(): void {
    // Generates a plausible 8-digit card suffix for convenience
    const random = Math.floor(10000000 + Math.random() * 89999999).toString();
    this.cardSuffix.set(random);
    this.cardTouched.set(true);
  }
}