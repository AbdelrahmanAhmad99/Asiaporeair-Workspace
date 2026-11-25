
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  PREDEFINED_CABIN_TYPES,
  CabinClassType,
  CABIN_CLASS_VISUALS,
} from '../../store/cabin-designer.store';

export interface ICabinFormSubmitEvent {
  name: string;   // Full display name to pass to the backend
  classType: CabinClassType;
}

@Component({
  selector: 'aoms-cabin-class-form-ui',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './cabin-class-form-ui.component.html',
  styleUrl: './cabin-class-form-ui.component.scss',
})
export class CabinClassFormUiComponent {
  // ── Inputs ──────────────────────────────────────────────────────────────
  readonly isProcessing = input<boolean>(false);
  readonly errorMessage = input<string | null>(null);

  // ── Output ──────────────────────────────────────────────────────────────
  readonly submitted = output<ICabinFormSubmitEvent>();
  readonly cancelled = output<void>();

  // ── Local State ──────────────────────────────────────────────────────────
  protected readonly types = PREDEFINED_CABIN_TYPES;
  protected readonly visuals = CABIN_CLASS_VISUALS;
  protected selectedType = signal<CabinClassType | ''>('');
  protected zoneName = signal<string>('');
  protected touched = signal<boolean>(false);

  // Computed visual for the selected type to avoid template casting issues
  protected readonly selectedVisual = computed(() => {
    const type = this.selectedType();
    return type ? this.visuals[type as CabinClassType] : null;
  });

  // Computed full name: "Business Class — Zone C Forward" or just "Business Class"
  protected readonly previewName = computed(() => {
    const visual = this.selectedVisual();
    if (!visual) return '';
    const base = visual.label;
    const extra = this.zoneName().trim();
    return extra ? `${base} — ${extra}` : base;
  });

  protected readonly typeError = computed(() => {
    if (!this.touched()) return null;
    if (!this.selectedType()) return 'Please select a cabin class type.';
    return null;
  });

  protected readonly isValid = computed(() => !!this.selectedType());

  protected onSubmit(): void {
    this.touched.set(true);
    if (!this.isValid() || this.isProcessing()) return;
    this.submitted.emit({
      name: this.previewName(),
      classType: this.selectedType() as CabinClassType,
    });
  }

  protected onCancel(): void {
    this.selectedType.set('');
    this.zoneName.set('');
    this.touched.set(false);
    this.cancelled.emit();
  }
}