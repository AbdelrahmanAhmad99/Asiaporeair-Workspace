// ============================================================================
// passenger-summary-card.component.ts
// Asiaporeair | Dumb Component — Individual Passenger Card
// ============================================================================

import {
  Component, Input, Output, EventEmitter,
  ChangeDetectionStrategy, computed, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IPassengerDto } from '@shared-core';

@Component({
  selector: 'app-passenger-summary-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './passenger-summary-card.component.html',
  styleUrls: ['./passenger-summary-card.component.scss']
})
export class PassengerSummaryCardComponent {

  @Input({ required: true }) passenger!: IPassengerDto;
  @Input() isDeleting: boolean = false;

  @Output() editClicked = new EventEmitter<IPassengerDto>();
  @Output() deleteClicked = new EventEmitter<number>();

  /** Local confirm-delete state to avoid accidental deletes */
  readonly showDeleteConfirm = signal<boolean>(false);

  get initials(): string {
    const f = this.passenger.firstName?.[0] ?? '';
    const l = this.passenger.lastName?.[0] ?? '';
    return (f + l).toUpperCase();
  }

  get fullName(): string {
    return `${this.passenger.firstName} ${this.passenger.lastName}`;
  }

  get formattedDob(): string {
    if (!this.passenger.dateOfBirth) return '—';
    try {
      return new Date(this.passenger.dateOfBirth).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric'
      });
    } catch {
      return this.passenger.dateOfBirth;
    }
  }

  /** Derive a display relationship tag from frequentFlyerCardNumber or default */
  get relationshipTag(): string {
    // In a real app this would come from a dedicated field.
    // We use a deterministic fallback based on passengerId.
    const tags = ['Family', 'Friend', 'Colleague', 'Travel Buddy'];
    return tags[(this.passenger.passengerId ?? 0) % tags.length];
  }

  onEdit(): void {
    this.editClicked.emit(this.passenger);
  }

  onDeleteRequest(): void {
    this.showDeleteConfirm.set(true);
  }

  onDeleteConfirm(): void {
    this.deleteClicked.emit(this.passenger.passengerId);
    this.showDeleteConfirm.set(false);
  }

  onDeleteCancel(): void {
    this.showDeleteConfirm.set(false);
  }
}