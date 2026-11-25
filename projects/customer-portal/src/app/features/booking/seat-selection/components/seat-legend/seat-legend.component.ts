// seat-legend.component.ts
import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-seat-legend',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './seat-legend.component.html',
  styleUrls: ['./seat-legend.component.scss']
})
export class SeatLegendComponent {
  readonly currency = input<string>('SGD');
}