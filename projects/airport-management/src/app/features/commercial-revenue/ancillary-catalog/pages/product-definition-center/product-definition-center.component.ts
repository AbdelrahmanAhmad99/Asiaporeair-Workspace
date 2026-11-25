
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
import { ActivatedRoute } from '@angular/router';

import { AncillaryCatalogStore } from '../../store/ancillary-catalog.store';
import {
  ProductConfigFormComponent,
  IProductIdentityFormValue,
} from '../../components/product-config-form/product-config-form.component';
import {
  PricingAdjustmentGroupComponent,
  IProductPricingFormValue,
  CURRENCY_OPTIONS,
} from '../../components/pricing-adjustment-group/pricing-adjustment-group.component';
import {
  ICreateAncillaryProductRequest,
  IUpdateAncillaryProductRequest,
} from '@shared-core';

// ── Combined snapshot used for dirty-checking ───────────────────────────────
interface IPersistedSnapshot {
  name: string;
  category: string;
  baseCost: number;
  unitOfMeasure: string;
}

@Component({
  selector: 'aoms-product-definition-center',
  standalone: true,
  imports: [
    CommonModule,
    ProductConfigFormComponent,
    PricingAdjustmentGroupComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-definition-center.component.html',
  styleUrl: './product-definition-center.component.scss',
})
export class ProductDefinitionCenterComponent implements OnInit, OnDestroy {
  protected readonly store = inject(AncillaryCatalogStore);
  private readonly route = inject(ActivatedRoute);

  /** Route :id param — null in Create mode. */
  protected readonly editId = signal<number | null>(null);

  // ── Live form values from the two dumb components ─────────────────────
  private readonly _identityValue = signal<IProductIdentityFormValue | null>(null);
  private readonly _pricingValue = signal<IProductPricingFormValue | null>(null);
  private readonly _identityValid = signal<boolean>(true);
  private readonly _pricingValid = signal<boolean>(true);

  /** Forces child forms to display validation errors on a failed submit. */
  protected readonly forceValidate = signal<boolean>(false);

  /** Snapshot of persisted fields at load time — used for dirty-checking. */
  private _loadedSnapshot: IPersistedSnapshot | null = null;

  /** True once the user has modified any persisted field. */
  protected readonly isDirty = signal<boolean>(false);

  /** "Preview Live" mock passenger view modal visibility. */
  protected readonly showPreviewModal = signal<boolean>(false);

  /** Success Shimmer trigger — re-keys to re-fire CSS animation. */
  protected readonly shimmerKey = signal<number>(0);

  // ── Dark mode ─────────────────────────────────────────────────────────
  protected readonly isDarkMode = signal<boolean>(
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('aoms-dark')
  );

  // ── Computed ──────────────────────────────────────────────────────────
  protected readonly isEditMode = computed(() => this.store.isEditorEditMode());

  /** Combined form validity. */
  protected readonly isFormValid = computed(
    () => this._identityValid() && this._pricingValid()
  );

  /** Live preview values for the "Preview Live" passenger mock. */
  protected readonly previewData = computed(() => {
    const identity = this._identityValue();
    const pricing = this._pricingValue();
    const currency = CURRENCY_OPTIONS.find(c => c.value === pricing?.currency)?.symbol ?? '$';
    const base = pricing?.baseCost ?? 0;
    const tax = pricing?.taxPercentage ?? 0;
    const net = base + base * (tax / 100);

    return {
      name: identity?.name?.trim() || 'Untitled Product',
      category: identity?.category || 'Other',
      description: identity?.description?.trim() || 'No description provided yet.',
      sku: identity?.sku?.trim() || '—',
      unit: pricing?.unitOfMeasure || 'piece',
      currencySymbol: currency,
      netPrice: net,
    };
  });

  // ── Lifecycle ─────────────────────────────────────────────────────────
  ngOnInit(): void {
    const rawId = this.route.snapshot.paramMap.get('id');
    const id = rawId ? parseInt(rawId, 10) : null;
    this.editId.set(id);

    if (id != null && !isNaN(id)) {
      this.store.fetchProductForEdit(id);
      // Snapshot will be captured once the product loads — see effect-like
      // handling below via a microtask poll on activeEditingProduct.
      this._waitForLoadAndSnapshot();
    } else {
      this._loadedSnapshot = { name: '', category: '', baseCost: 0, unitOfMeasure: 'piece' };
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

  // ── Form Value Handlers ────────────────────────────────────────────────

  protected onIdentityChanged(value: IProductIdentityFormValue): void {
    this._identityValue.set(value);
    this._recomputeDirty();
  }

  protected onIdentityValidityChanged(valid: boolean): void {
    this._identityValid.set(valid);
  }

  protected onPricingChanged(value: IProductPricingFormValue): void {
    this._pricingValue.set(value);
    this._recomputeDirty();
  }

  protected onPricingValidityChanged(valid: boolean): void {
    this._pricingValid.set(valid);
  }

  // ── Save Flow ──────────────────────────────────────────────────────────

  protected async onSave(): Promise<void> {
    if (!this.isFormValid()) {
      this.forceValidate.set(true);
      return;
    }

    const identity = this._identityValue();
    const pricing = this._pricingValue();
    if (!identity || !pricing) return;

    // Strip UI-only fields (sku, description, taxPercentage, currency)
    // before sending to the backend — the model only persists
    // name, category, baseCost, unitOfMeasure.
    const payload: ICreateAncillaryProductRequest | IUpdateAncillaryProductRequest = {
      name: identity.name.trim(),
      category: identity.category,
      baseCost: Number(pricing.baseCost),
      unitOfMeasure: pricing.unitOfMeasure,
    };

    // Dirty-check guard: in edit mode, only call updateProduct if the
    // persisted fields actually differ from the loaded snapshot.
    if (this.isEditMode() && !this.isDirty()) {
      return;
    }

    const ok = await this.store.saveAncillaryProduct(payload);
    if (ok) {
      // Refresh snapshot to the just-saved values, reset dirty flag,
      // and fire the Royal Gold Success Shimmer.
      this._loadedSnapshot = { ...payload };
      this.isDirty.set(false);
      this.shimmerKey.update(k => k + 1);
    }
  }

  // ── Navigation ─────────────────────────────────────────────────────────

  protected onDiscardChanges(): void {
    this.store.navigateToCatalog();
  }

  protected onTogglePreview(): void {
    this.showPreviewModal.update(v => !v);
  }

  protected onClosePreview(): void {
    this.showPreviewModal.set(false);
  }

  // ── Error Guard ────────────────────────────────────────────────────────

  protected onDismissError(): void {
    this.store.clearEditorError();
  }

  // ── Private ────────────────────────────────────────────────────────────

  /**
   * Polls activeEditingProduct until it loads, then captures the
   * dirty-check snapshot from the persisted fields.
   */
  private _waitForLoadAndSnapshot(): void {
    const check = () => {
      const product = this.store.activeEditingProduct();
      if (product) {
        this._loadedSnapshot = {
          name: product.name,
          category: product.category,
          baseCost: product.baseCost,
          unitOfMeasure: product.unitOfMeasure,
        };
        return;
      }
      if (this.store.isLoadingEdit()) {
        setTimeout(check, 100);
      }
    };
    setTimeout(check, 100);
  }

  /** Compare current form values against the loaded snapshot for dirty state. */
  private _recomputeDirty(): void {
    if (!this._loadedSnapshot) return;

    const identity = this._identityValue();
    const pricing = this._pricingValue();
    if (!identity || !pricing) return;

    const current: IPersistedSnapshot = {
      name: identity.name.trim(),
      category: identity.category,
      baseCost: Number(pricing.baseCost),
      unitOfMeasure: pricing.unitOfMeasure,
    };

    const changed =
      current.name !== this._loadedSnapshot.name ||
      current.category !== this._loadedSnapshot.category ||
      current.baseCost !== this._loadedSnapshot.baseCost ||
      current.unitOfMeasure !== this._loadedSnapshot.unitOfMeasure;

    this.isDirty.set(changed);
  }
}