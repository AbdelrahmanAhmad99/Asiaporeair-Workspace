
import {
  ChangeDetectionStrategy,
  Component,
  OnChanges,
  SimpleChanges,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IPassengerDto, IUpdatePassengerDto } from '@shared-core';

@Component({
  selector: 'aoms-passenger-detail-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './passenger-detail-form.component.html',
  styleUrl: './passenger-detail-form.component.scss',
})
export class PassengerDetailFormComponent implements OnChanges {
  // ── Inputs ─────────────────────────────────────────────────────────────
  readonly passenger = input.required<IPassengerDto>();
  readonly actionLoading = input<boolean>(false);
  readonly actionError = input<string | null>(null);
  readonly actionSuccess = input<string | null>(null);

  // ── Outputs ────────────────────────────────────────────────────────────
  readonly saved = output<{ id: number; data: IUpdatePassengerDto }>();
  readonly closed = output<void>();
  readonly deleteRequested = output<void>();

  // ── Local form state ───────────────────────────────────────────────────
  protected readonly form = signal<IUpdatePassengerDto>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    passportNumber: '',
  });

  protected readonly isDirty = signal<boolean>(false);

  // ── Sync from parent when passenger changes ────────────────────────────
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['passenger']) {
      const p = this.passenger();
      this.form.set({
        firstName: p.firstName,
        lastName: p.lastName,
        dateOfBirth: p.dateOfBirth
          ? new Date(p.dateOfBirth).toISOString().split('T')[0]
          : '',
        passportNumber: p.passportNumber ?? '',
      });
      this.isDirty.set(false);
    }
  }

  // ── Form helpers ───────────────────────────────────────────────────────
  protected onFieldChange(field: keyof IUpdatePassengerDto, value: string): void {
    this.form.update(f => ({ ...f, [field]: value }));
    this.isDirty.set(true);
  }

  protected onSave(): void {
    if (!this.isDirty() || this.actionLoading()) return;
    this.saved.emit({ id: this.passenger().passengerId, data: { ...this.form() } });
    this.isDirty.set(false);
  }

  protected onDiscard(): void {
    const p = this.passenger();
    this.form.set({
      firstName: p.firstName,
      lastName: p.lastName,
      dateOfBirth: p.dateOfBirth
        ? new Date(p.dateOfBirth).toISOString().split('T')[0]
        : '',
      passportNumber: p.passportNumber ?? '',
    });
    this.isDirty.set(false);
  }
}