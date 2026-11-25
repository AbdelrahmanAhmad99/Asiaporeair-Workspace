
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ICabinClassViewModel } from '../../store/cabin-designer.store';

@Component({
  selector: 'aoms-cabin-class-segment',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './cabin-class-segment.component.html',
  styleUrl: './cabin-class-segment.component.scss',
})
export class CabinClassSegmentComponent {
  readonly cabin = input.required<ICabinClassViewModel>();
  readonly isRemoving = input<boolean>(false);

  readonly designSeats = output<number>();  // emits cabinClassId
  readonly removeZone = output<number>();  // emits cabinClassId

  protected readonly Math = Math;
  protected readonly Array = Array;
}