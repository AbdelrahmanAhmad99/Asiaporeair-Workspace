
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  DynamicPricingStore,
  ISimulationContext,
} from '../../store/dynamic-pricing.store';
import { SimulationInputFormComponent } from '../../components/simulation-input-form/simulation-input-form.component';
import { MatchingResultPanelComponent } from '../../components/matching-result-panel/matching-result-panel.component';
import { AttributeLogicVisualizerComponent } from '../../components/attribute-logic-visualizer/attribute-logic-visualizer.component';
import { IContextualPricingAttributeDto } from '@shared-core';

@Component({
  selector: 'aoms-rule-simulation-lab',
  standalone: true,
  imports: [
    CommonModule,
    SimulationInputFormComponent,
    MatchingResultPanelComponent,
    AttributeLogicVisualizerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './rule-simulation-lab.component.html',
  styleUrl: './rule-simulation-lab.component.scss',
})
export class RuleSimulationLabComponent implements OnInit, OnDestroy {
  protected readonly store = inject(DynamicPricingStore);

  /**
   * The rule currently selected in the results panel — drives the visualizer.
   * Defaults to topRule on simulation completion.
   */
  protected readonly selectedRule = signal<IContextualPricingAttributeDto | null>(null);

  /** Whether the technical detail section of the error banner is expanded. */
  protected readonly showTechnicalDetail = signal<boolean>(false);

  // ── Dark mode ─────────────────────────────────────────────────────────
  protected readonly isDarkMode = signal<boolean>(
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('aoms-dark')
  );

  // ── Parsed error computed ──────────────────────────────────────────────
  /** Human-readable part of the structured error string. */
  protected readonly errorMessage = computed<string>(() => {
    const raw = this.store.simulationError();
    if (!raw) return '';
    return raw.split('||')[0] ?? raw;
  });

  /** Technical detail part of the structured error string. */
  protected readonly errorTechnical = computed<string>(() => {
    const raw = this.store.simulationError();
    if (!raw) return '';
    return raw.split('||')[1] ?? '';
  });

  // ── Lifecycle ─────────────────────────────────────────────────────────
  ngOnInit(): void {
    // Restore selected rule to topRule if simulation results already exist
    // (state persists in the singleton store across tab switches)
    const top = this.store.topRule();
    if (top) this.selectedRule.set(top);
  }

  ngOnDestroy(): void {
    // Intentionally NOT clearing simulation state on destroy —
    // the spec requires state to survive tab switches.
    // The store singleton keeps it alive.
    this.store.clearSimulationError();
  }

  // ── Dark Mode Toggle ───────────────────────────────────────────────────
  protected toggleDarkMode(): void {
    const next = !this.isDarkMode();
    document.documentElement.classList.toggle('aoms-dark', next);
    this.isDarkMode.set(next);
  }

  // ── Simulation Flow ────────────────────────────────────────────────────

  protected onFormSubmit(context: ISimulationContext): void {
    this.selectedRule.set(null);
    this.showTechnicalDetail.set(false);
    this.store.runSimulation(context);

    // After simulation completes, auto-select the top rule for the visualizer.
    // We use a microtask so the store signals settle before we read them.
    setTimeout(() => {
      const top = this.store.topRule();
      if (top) this.selectedRule.set(top);
    }, 0);
  }

  protected onReset(): void {
    this.store.resetSimulation();
    this.selectedRule.set(null);
    this.showTechnicalDetail.set(false);
  }

  // ── Result Interaction ─────────────────────────────────────────────────

  protected onRuleSelected(rule: IContextualPricingAttributeDto): void {
    this.selectedRule.set(rule);
  }

  // ── Error Banner ───────────────────────────────────────────────────────

  protected toggleTechnicalDetail(): void {
    this.showTechnicalDetail.update(v => !v);
  }

  protected dismissError(): void {
    this.store.clearSimulationError();
    this.showTechnicalDetail.set(false);
  }

  // ── Navigation ─────────────────────────────────────────────────────────

  protected onBackToManager(): void {
    this.store.navigateToManager();
  }
}