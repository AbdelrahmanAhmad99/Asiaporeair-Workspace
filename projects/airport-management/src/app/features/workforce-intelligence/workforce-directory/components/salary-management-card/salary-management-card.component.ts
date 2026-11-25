

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface ISalaryUpdate {
  newSalary: number;
  reason: string;
}

@Component({
  selector: 'aoms-salary-management-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './salary-management-card.component.html',
  styleUrl: './salary-management-card.component.scss',
})
export class SalaryManagementCardComponent {
  readonly currentSalary = input.required<number>();
  readonly isProcessing = input<boolean>(false);
  readonly currency = input<string>('SGD');

  readonly salarySaved = output<ISalaryUpdate>();
  readonly editCancelled = output<void>();

  protected readonly isEditing = signal<boolean>(false);
  protected readonly newSalary = signal<string | number>('');
  protected readonly reason = signal<string>('');
  protected readonly validationMsg = signal<string | null>(null);

  constructor() {
    // Automatically exit edit mode when currentSalary is updated from the outside (post-save)
    effect(() => {
      this.currentSalary();
      untracked(() => this.isEditing.set(false));
    });
  }

  protected readonly parsedSalary = computed<number | null>(() => {
    const val = this.newSalary();
    if (val === null || val === undefined || val === '') return null;
    if (typeof val === 'number') return val;
    const v = parseFloat(val.toString().replace(/,/g, ''));
    return isNaN(v) ? null : v;
  });

  protected readonly isValid = computed(() => {
    const v = this.parsedSalary();
    if (!v || v <= 0) return false;
    if (v === this.currentSalary()) return false;
    return true;
  });

  protected onEditOpen(): void {
    this.newSalary.set(this.currentSalary().toString());
    this.reason.set('');
    this.validationMsg.set(null);
    this.isEditing.set(true);
  }

  protected onCancel(): void {
    this.isEditing.set(false);
    this.validationMsg.set(null);
    this.editCancelled.emit();
  }

  protected onSave(): void {
    const val = this.parsedSalary();
    if (!val || val <= 0) {
      this.validationMsg.set('Please enter a valid salary amount.');
      return;
    }
    if (val === this.currentSalary()) {
      this.validationMsg.set('The new salary must differ from the current figure.');
      return;
    }
    this.validationMsg.set(null);
    this.salarySaved.emit({ newSalary: val, reason: this.reason() });
  }
}