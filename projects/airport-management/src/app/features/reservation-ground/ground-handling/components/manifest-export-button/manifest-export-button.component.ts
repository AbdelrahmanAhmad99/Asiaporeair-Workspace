
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export type ExportFormat = 'PDF' | 'EXCEL' | 'CSV';

@Component({
  selector: 'aoms-manifest-export-button',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './manifest-export-button.component.html',
  styleUrl: './manifest-export-button.component.scss',
})
export class ManifestExportButtonComponent {
  readonly disabled = input<boolean>(false);
  readonly isLoading = input<boolean>(false);

  readonly formatSelected = output<ExportFormat>();

  protected readonly menuOpen = signal<boolean>(false);

  protected toggleMenu(): void {
    if (this.disabled() || this.isLoading()) return;
    this.menuOpen.update(v => !v);
  }

  protected select(format: ExportFormat): void {
    this.menuOpen.set(false);
    this.formatSelected.emit(format);
  }

  protected onBlur(): void {
    // Close menu on next tick to allow click events to register
    setTimeout(() => this.menuOpen.set(false), 120);
  }
}