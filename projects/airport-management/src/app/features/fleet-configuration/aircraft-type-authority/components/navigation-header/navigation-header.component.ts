
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IAircraftTypeDto } from '@shared-core';

export type HeaderAction = 'back' | 'edit' | 'archive' | 'print';

@Component({
  selector: 'aoms-navigation-header',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './navigation-header.component.html',
  styleUrl: './navigation-header.component.scss',
})
export class NavigationHeaderComponent {
  // ── Inputs ──────────────────────────────────────────────────────────────
  readonly aircraftType = input<IAircraftTypeDto | null>(null);
  readonly isLoading = input<boolean>(false);
  readonly isDarkMode = input<boolean>(false);

  // ── Outputs ─────────────────────────────────────────────────────────────
  readonly actionTriggered = output<HeaderAction>();
  readonly darkModeToggled = output<void>();
}