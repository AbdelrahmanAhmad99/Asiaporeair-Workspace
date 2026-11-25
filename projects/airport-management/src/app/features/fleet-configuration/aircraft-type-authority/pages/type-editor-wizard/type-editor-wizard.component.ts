
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { AircraftTypesStore } from '../../store/aircraft-types.store';
import { IFormDraft } from '../../store/aircraft-types.store';
import { ICanDeactivate } from '../../../../../core/guards/unsaved-changes.guard';
import { AircraftTypeFormUiComponent } from '../../components/aircraft-type-form-ui/aircraft-type-form-ui.component';
import { ActionFooterComponent, FooterAction } from '../../components/action-footer/action-footer.component';
import {
  ICreateAircraftTypeDto,
  IUpdateAircraftTypeDto,
} from '@shared-core';

const ATA_BASE = 'aoms/fleet-configuration/aircraft-type-authority';

@Component({
  selector: 'aoms-type-editor-wizard',
  standalone: true,
  imports: [
    CommonModule,
    AircraftTypeFormUiComponent,
    ActionFooterComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './type-editor-wizard.component.html',
  styleUrl: './type-editor-wizard.component.scss',
})
export class TypeEditorWizardComponent implements OnInit, OnDestroy, ICanDeactivate {
  protected readonly store = inject(AircraftTypesStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  /** Numeric typeId from the route — null means create mode. */
  private _typeId: number | null = null;

  /** Tracks whether the current form is valid (updated by form output). */
  protected readonly isFormValid = signal<boolean>(false);

  /** Local snapshot of the draft to pass to the form as initialValue. */
  protected readonly formSeed = computed(() => this.store.formDraft());

  // Theme signal
  protected readonly isDarkMode = signal<boolean>(
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('aoms-dark')
  );

  constructor() {
    // ── Effect: when async detail data arrives, re-seed the editor state ──
    // This handles the case where the user lands on /editor/:id directly
    // (page refresh) and the list cache is empty — the detail pipeline
    // fires and we must re-patch the draft once data arrives.
    effect(() => {
      const type = this.store.selectedAircraftType();
      if (type && this._typeId != null) {
        // Only re-seed if we're in edit mode AND draft is still blank
        // (i.e. cache miss on init — don't clobber user edits)
        untracked(() => {
          const draft = this.store.formDraft();
          if (!draft.model && !draft.manufacturer) {
            this.store.setEditMode(this._typeId);
          }
        });
      }
    });
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────
  ngOnInit(): void {
    const raw = this.route.snapshot.paramMap.get('id');
    this._typeId = raw ? parseInt(raw, 10) : null;

    if (this._typeId != null && isNaN(this._typeId)) {
      // Malformed id — fall back to create mode
      this._typeId = null;
    }

    this.store.setEditMode(this._typeId);
  }

  ngOnDestroy(): void {
    this.store.clearEditorState();
  }

  // ── ICanDeactivate ─────────────────────────────────────────────────────
  canDeactivate(): boolean {
    return !this.store.isDirty();
  }

  // ── Dark Mode Toggle ───────────────────────────────────────────────────
  protected toggleDarkMode(): void {
    const html = document.documentElement;
    const next = !this.isDarkMode();
    html.classList.toggle('aoms-dark', next);
    this.isDarkMode.set(next);
  }

  // ── Form Bridge ────────────────────────────────────────────────────────

  /** Receives every keystroke from the form and patches the store draft. */
  protected onFormChanged(partial: Partial<IFormDraft>): void {
    this.store.patchDraft(partial);
  }

  /** Keeps `isFormValid` in sync with the form's validity. */
  protected onValidityChanged(valid: boolean): void {
    this.isFormValid.set(valid);
  }

  // ── Footer Action Dispatcher ───────────────────────────────────────────
  protected async onFooterAction(action: FooterAction): Promise<void> {
    switch (action) {
      case 'discard':
        this.store.discardChanges();
        break;

      case 'delete':
        if (this._typeId != null) {
          this.store.handleAction(this._typeId, 'delete');
        }
        break;

      case 'save':
        await this._persistForm();
        break;
    }
  }

  // ── Save Orchestration ─────────────────────────────────────────────────
  private async _persistForm(): Promise<void> {
    const draft = this.store.formDraft();

    // Build the DTO from the current draft
    const payload: ICreateAircraftTypeDto | IUpdateAircraftTypeDto = {
      model: draft.model,
      manufacturer: draft.manufacturer,
      rangeKm: draft.rangeKm ?? undefined,
      maxSeats: draft.maxSeats ?? undefined,
      cargoCapacity: draft.cargoCapacity ?? undefined,
      cruisingVelocity: draft.cruisingVelocity ?? undefined,
    };

    const result = await this.store.saveAircraftType(payload, this._typeId ?? undefined);

    if (result.success) {
      // Navigate to the detail page of the saved type
      this.router.navigate([ATA_BASE, 'details', result.type.typeId]);
    }
    // On failure the store populates saveError and validationErrors —
    // those flow into the form via the serverErrors input binding.
  }
}