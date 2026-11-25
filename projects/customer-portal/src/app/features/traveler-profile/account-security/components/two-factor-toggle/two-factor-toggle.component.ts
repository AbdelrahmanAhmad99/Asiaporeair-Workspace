// ============================================================================
// two-factor-toggle.component.ts
// Asiaporeair | Dumb Component — 2FA Toggle Switch
// ============================================================================

import {
  Component, Input, Output, EventEmitter, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-two-factor-toggle',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './two-factor-toggle.component.html',
  styleUrls: ['./two-factor-toggle.component.scss']
})
export class TwoFactorToggleComponent {

  @Input() isEnabled: boolean = false;
  @Input() isLoading: boolean = false;
  @Input() isToggling: boolean = false;

  @Output() toggle = new EventEmitter<void>();

  onToggle(): void {
    if (!this.isLoading && !this.isToggling) {
      this.toggle.emit();
    }
  }
}