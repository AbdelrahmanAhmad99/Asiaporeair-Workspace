/**
 * crew-selector-modal.component.ts
 * DUMB — Modal to search and select available crew for assignment.
 */
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
import { IFlightInstanceDto, IFlightInstanceFilterDto } from '@shared-core';
import { ITrcPagination } from '../../store/tactical-trc.store';

@Component({
  selector: 'aoms-crew-selector-modal',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './crew-selector-modal.component.html',
  styleUrl: './crew-selector-modal.component.scss',
})
export class CrewSelectorModalComponent {
  readonly mode = input.required<'pilot' | 'attendant'>();
  readonly crewList = input.required<import('@shared-core').ICrewMemberSummaryDto[]>();
  readonly loading = input<boolean>(false);
  readonly isAssigning = input<boolean>(false);

  readonly assignSelected = output<number[]>();
  readonly closed = output<void>();

  protected readonly selected = signal<Set<number>>(new Set());
  protected readonly selectedArr = computed<number[]>(() => [...this.selected()]);

  protected toggle(id: number): void {
    this.selected.update(s => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  protected onConfirm(): void {
    if (this.selectedArr().length === 0) return;
    this.assignSelected.emit(this.selectedArr());
  }

  protected initials(name: string): string {
    const parts = name.split(' ');
    return `${parts[0]?.[0] ?? ''}${parts.at(-1)?.[0] ?? ''}`.toUpperCase();
  }
}