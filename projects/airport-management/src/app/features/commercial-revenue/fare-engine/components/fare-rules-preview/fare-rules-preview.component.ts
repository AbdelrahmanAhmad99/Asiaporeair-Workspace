

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { IFarePolicyFormValue } from '../fare-policy-form/fare-policy-form.component';

@Component({
  selector: 'aoms-fare-rules-preview',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './fare-rules-preview.component.html',
  styleUrl: './fare-rules-preview.component.scss',
})
export class FareRulesPreviewComponent {
  // ── Inputs ──────────────────────────────────────────────────────────────
  readonly previewValue = input<IFarePolicyFormValue | null>(null);
  readonly isEditMode = input<boolean>(false);
  readonly fareCode = input<string | null>(null);

  // ── Computed helpers ───────────────────────────────────────────────────

  /** The display code — live from the form or the route param in edit mode. */
  readonly displayCode = computed(() => {
    const val = this.previewValue();
    return val?.code?.trim() || this.fareCode() || '—';
  });

  readonly displayDescription = computed(() => {
    return this.previewValue()?.description?.trim() || '—';
  });

  readonly hasRules = computed(() => {
    const rules = this.previewValue()?.rules?.trim() ?? '';
    return rules.length > 0;
  });

  readonly rulesText = computed(() => {
    return this.previewValue()?.rules?.trim() ?? '';
  });

  /** Character count for the rules field */
  readonly rulesCharCount = computed(() => {
    return this.previewValue()?.rules?.length ?? 0;
  });

  /** True if the form has any content to display (not all empty). */
  readonly hasContent = computed(() => {
    const val = this.previewValue();
    if (!val) return false;
    return (
      (val.code?.trim().length ?? 0) > 0 ||
      (val.description?.trim().length ?? 0) > 0 ||
      (val.rules?.trim().length ?? 0) > 0
    );
  });
}