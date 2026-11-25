// ============================================================================
// virtual-tour-button.component.ts
// Asiaporeair | Dumb Component — Virtual Tour CTA Button
// ============================================================================

import {
  Component, Input, Output, EventEmitter, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-virtual-tour-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './virtual-tour-button.component.html',
  styleUrl: './virtual-tour-button.component.scss',
})
export class VirtualTourButtonComponent {
  @Input() label: string = 'Explore Virtual Tour';
  @Output() clicked = new EventEmitter<void>();
}