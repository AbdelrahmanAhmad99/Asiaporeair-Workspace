import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import {
  DynamicPricingStore,
} from '../../store/dynamic-pricing.store';
import { RuleBuilderFormComponent, IRuleBuilderFormValue } from '../../components/rule-builder-form/rule-builder-form.component';
import { AttributeEditorVisualizerComponent } from '../../components/attribute-editor-visualizer/attribute-editor-visualizer.component';
import {
  ICreatePricingAttributeDto,
  IUpdatePricingAttributeDto,
} from '@shared-core';

@Component({
  selector: 'aoms-dynamic-rule-editor',
  standalone: true,
  imports: [
    CommonModule,
    RuleBuilderFormComponent,
    AttributeEditorVisualizerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dynamic-rule-editor.component.html',
  styleUrl: './dynamic-rule-editor.component.scss',
})
export class DynamicRuleEditorComponent implements OnInit, OnDestroy {
  protected readonly store = inject(DynamicPricingStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  /** Route :id param — null in Create mode */
  protected readonly editId = signal<number | null>(null);

  /** Live form value driving the visualizer */
  protected readonly liveFormValue = signal<IRuleBuilderFormValue | null>(null);

  /** True once the user modifies the form — enables draft protection */
  protected readonly isDirty = signal<boolean>(false);

  /** Draft protection dialog visibility */
  protected readonly showDraftDialog = signal<boolean>(false);

  /** Pending navigation target stored while the dialog is open */
  private _pendingNavTarget: 'manager' | 'lab' | null = null;

  // ── Dark mode ─────────────────────────────────────────────────────────
  protected readonly isDarkMode = signal<boolean>(
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('aoms-dark')
  );

  // ── Lifecycle ─────────────────────────────────────────────────────────
  ngOnInit(): void {
    const rawId = this.route.snapshot.paramMap.get('id');
    const id = rawId ? parseInt(rawId, 10) : null;
    this.editId.set(id);

    if (id != null && !isNaN(id)) {
      this.store.loadRuleById(id);
    } else {
      this.store.initNewRule();
    }
  }

  ngOnDestroy(): void {
    this.store.clearEditorState();
  }

  // ── Dark Mode Toggle ───────────────────────────────────────────────────
  protected toggleDarkMode(): void {
    const next = !this.isDarkMode();
    document.documentElement.classList.toggle('aoms-dark', next);
    this.isDarkMode.set(next);
  }

  // ── Form Events ────────────────────────────────────────────────────────

  /** Fires on every form valueChanges — drives the live visualizer. */
  protected onValueChanged(value: IRuleBuilderFormValue): void {
    this.liveFormValue.set(value);
    this.isDirty.set(true);
  }

  /** Save / Publish the rule. */
  protected async onPublish(value: IRuleBuilderFormValue): Promise<void> {
    const currentId = this.editId();

    if (currentId != null) {
      // ── Update mode ──
      const dto: IUpdatePricingAttributeDto = {
        timeUntilDeparture: value.timeUntilDeparture,
        lengthOfStay: value.lengthOfStay,
        competitorFares: value.competitorFares || '',
        willingnessToPay: value.willingnessToPay,
        attributeType: value.attributeType,
        targetValue: value.targetValue,
        modifierPercentage: value.modifierPercentage,
        priority: value.priority,
      };
      const ok = await this.store.saveRule(dto);
      if (ok) this.isDirty.set(false);
    } else {
      // ── Create mode ──
      const dto: ICreatePricingAttributeDto = {
        timeUntilDeparture: value.timeUntilDeparture,
        lengthOfStay: value.lengthOfStay,
        competitorFares: value.competitorFares || '',
        willingnessToPay: value.willingnessToPay,
        attributeType: value.attributeType,
        targetValue: value.targetValue,
        modifierPercentage: value.modifierPercentage,
        priority: value.priority,
      };
      const ok = await this.store.saveRule(dto);
      if (ok) {
        this.isDirty.set(false);
        // Promote URL to edit mode without full navigation cycle
        const saved = this.store.selectedAttributeSet();
        if (saved) {
          this.editId.set(saved.attributeId);
          this.router.navigate(['..', saved.attributeId], {
            relativeTo: this.route,
            replaceUrl: true,
          });
        }
      }
    }
  }

  // ── Navigation ─────────────────────────────────────────────────────────

  protected onBackToManager(): void {
    if (this.isDirty()) {
      this._pendingNavTarget = 'manager';
      this.showDraftDialog.set(true);
    } else {
      this._goToManager();
    }
  }

  protected onPreviewInLab(): void {
    if (this.isDirty()) {
      this._pendingNavTarget = 'lab';
      this.showDraftDialog.set(true);
    } else {
      this.store.navigateToSimulationLab();
    }
  }

  // ── Draft Protection Dialog ────────────────────────────────────────────

  protected onDraftDiscardAndLeave(): void {
    this.isDirty.set(false);
    this.showDraftDialog.set(false);
    if (this._pendingNavTarget === 'manager') this._goToManager();
    else if (this._pendingNavTarget === 'lab') this.store.navigateToSimulationLab();
    this._pendingNavTarget = null;
  }

  protected onDraftKeepEditing(): void {
    this.showDraftDialog.set(false);
    this._pendingNavTarget = null;
  }

  // ── Private ────────────────────────────────────────────────────────────
  private _goToManager(): void {
    this.store.navigateToManager();
  }
}