
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

import { FareEngineStore } from '../../store/fare-engine.store';
import { FarePolicyFormComponent, IFarePolicyFormValue } from '../../components/fare-policy-form/fare-policy-form.component';
import { FareRulesPreviewComponent } from '../../components/fare-rules-preview/fare-rules-preview.component';
import { ICreateFareBasisCodeDto, IUpdateFareBasisCodeDto } from '@shared-core';

@Component({
  selector: 'aoms-fare-policy-configurator',
  standalone: true,
  imports: [
    CommonModule,
    FarePolicyFormComponent,
    FareRulesPreviewComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './fare-policy-configurator.component.html',
  styleUrl: './fare-policy-configurator.component.scss',
})
export class FarePolicyConfiguratorComponent implements OnInit, OnDestroy {
  protected readonly store = inject(FareEngineStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  /** The code extracted from the route — null in Create mode. */
  protected readonly editCode = signal<string | null>(null);

  /** Live preview data — updated on every form value change. */
  protected readonly previewValue = signal<IFarePolicyFormValue | null>(null);

  /**
   * Dirty flag — set to true when the user first modifies the form.
   * Used by the unsaved-changes dialog before navigating away.
   */
  protected readonly isDirty = signal<boolean>(false);

  /** Controls the unsaved-changes confirmation dialog. */
  protected readonly showUnsavedDialog = signal<boolean>(false);

  /** Pending navigation target stored while the dialog is open. */
  private _pendingNavTarget: string | null = null;

  // ── Dark mode ──────────────────────────────────────────────────────────
  protected readonly isDarkMode = signal<boolean>(
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('aoms-dark')
  );

  // ── Lifecycle ──────────────────────────────────────────────────────────
  ngOnInit(): void {
    const code = this.route.snapshot.paramMap.get('code');
    this.editCode.set(code);

    if (code) {
      this.store.getFareDetails(code);
    } else {
      // Ensure no stale fare is shown when navigating from edit → create
      this.store.clearConfiguratorState();
    }
  }

  ngOnDestroy(): void {
    this.store.clearConfiguratorState();
  }

  // ── Dark Mode Toggle ───────────────────────────────────────────────────
  protected toggleDarkMode(): void {
    const next = !this.isDarkMode();
    document.documentElement.classList.toggle('aoms-dark', next);
    this.isDarkMode.set(next);
  }

  // ── Form Events ────────────────────────────────────────────────────────

  /** Fires on every form.valueChanges — drives the live preview panel. */
  protected onFormValueChanged(value: IFarePolicyFormValue): void {
    this.previewValue.set(value);
    this.isDirty.set(true);
  }

  protected async onSaveRequested(value: IFarePolicyFormValue): Promise<void> {
    const code = this.editCode();

    if (code) {
      // ── Update mode ──
      const dto: IUpdateFareBasisCodeDto = {
        description: value.description,
        rules: value.rules,
      };
      const ok = await this.store.updateFare(code, dto);
      if (ok) {
        this.isDirty.set(false);
        this._goToInventory();
      }
    } else {
      // ── Create mode ──
      const dto: ICreateFareBasisCodeDto = {
        code: value.code,
        description: value.description,
        rules: value.rules,
      };
      const ok = await this.store.createFare(dto);
      if (ok) {
        this.isDirty.set(false);
        this._goToInventory();
      }
    }
  }

  // ── Navigation ─────────────────────────────────────────────────────────

  protected onReturnToInventory(): void {
    if (this.isDirty()) {
      this._pendingNavTarget = 'inventory';
      this.showUnsavedDialog.set(true);
    } else {
      this._goToInventory();
    }
  }

  // ── Unsaved Changes Dialog ────────────────────────────────────────────

  protected onUnsavedDialogDiscard(): void {
    this.isDirty.set(false);
    this.showUnsavedDialog.set(false);
    if (this._pendingNavTarget === 'inventory') {
      this._goToInventory();
    }
    this._pendingNavTarget = null;
  }

  protected onUnsavedDialogKeepEditing(): void {
    this.showUnsavedDialog.set(false);
    this._pendingNavTarget = null;
  }

  // ── Private ────────────────────────────────────────────────────────────

  private _goToInventory(): void {
    this.router.navigate(['/aoms/commercial-revenue/fare-engine/fare-basis-inventory']);
  }
}