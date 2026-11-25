// ============================================================================
// action-buttons-group.component.ts
// Asiaporeair | Boarding Pass Action Bar — Dumb Component
// Three actions: Download PDF · Send to Email · Return to Main Suite
// ============================================================================

import {
  Component, Output, EventEmitter, Input,
  ChangeDetectionStrategy, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-action-buttons-group',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  templateUrl: './action-buttons-group.component.html',
  styleUrls: ['./action-buttons-group.component.scss']
})
export class ActionButtonsGroupComponent {

  @Input() isDownloading: boolean = false;
  @Input() isSendingEmail: boolean = false;
  @Input() passengerName: string = '';

  @Output() downloadPdf = new EventEmitter<void>();
  @Output() sendEmail = new EventEmitter<string>();
  @Output() returnToHome = new EventEmitter<void>();
  @Output() checkInAnother = new EventEmitter<void>();

  // ── Email inline form state ────────────────────────────────────────────────
  readonly showEmailForm = signal<boolean>(false);
  readonly emailValue = signal<string>('');
  readonly emailError = signal<string | null>(null);
  readonly emailSent = signal<boolean>(false);

  onEmailInput(event: Event): void {
    this.emailValue.set((event.target as HTMLInputElement).value);
    this.emailError.set(null);
  }

  onSendEmailSubmit(): void {
    const email = this.emailValue().trim();
    if (!email) {
      this.emailError.set('Please enter your email address.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.emailError.set('Please enter a valid email address.');
      return;
    }
    this.sendEmail.emit(email);
    this.emailSent.set(true);
    setTimeout(() => this.showEmailForm.set(false), 2200);
  }

  toggleEmailForm(): void {
    this.showEmailForm.update(v => !v);
    this.emailError.set(null);
    this.emailSent.set(false);
  }
}