
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
  animate,
  query,
  stagger,
  style,
  transition,
  trigger,
} from '@angular/animations';

import { CabinDesignerStore } from '../../store/cabin-designer.store';
import { CabinClassSegmentComponent } from '../../components/cabin-class-segment/cabin-class-segment.component';
import { CabinClassFormUiComponent, ICabinFormSubmitEvent } from '../../components/cabin-class-form-ui/cabin-class-form-ui.component';
import { CabinDeleteModalComponent } from '../../components/cabin-delete-modal/cabin-delete-modal.component';

// ── Staggered entry animation for zone cards ──────────────────────────────
export const zoneCardAnimation = trigger('zoneCards', [
  transition('* => *', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateX(-16px)' }),
      stagger(55, [
        animate(
          '280ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({ opacity: 1, transform: 'translateX(0)' })
        ),
      ]),
    ], { optional: true }),
  ]),
]);

const LCC_BASE = 'aoms/fleet-configuration/cabin-configuration-designer';

@Component({
  selector: 'aoms-cabin-class-builder',
  standalone: true,
  imports: [
    CommonModule,
    CabinClassSegmentComponent,
    CabinClassFormUiComponent,
    CabinDeleteModalComponent,
  ],
  animations: [zoneCardAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './cabin-class-builder.component.html',
  styleUrl: './cabin-class-builder.component.scss',
})
export class CabinClassBuilderComponent implements OnInit, OnDestroy {
  protected readonly store = inject(CabinDesignerStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected configId = 0;
  protected tailNumber = '';

  // ── Add Form ───────────────────────────────────────────────────────────
  protected readonly showAddForm = signal<boolean>(false);

  // ── Delete Modal ───────────────────────────────────────────────────────
  protected readonly showDeleteModal = signal<boolean>(false);
  protected readonly pendingDeleteId = signal<number | null>(null);
  protected readonly pendingDeleteName = signal<string>('');

  // ── Dark Mode ──────────────────────────────────────────────────────────
  protected readonly isDarkMode = signal<boolean>(
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('aoms-dark')
  );

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('configId');
    this.configId = parseInt(idParam ?? '0', 10);
    this.tailNumber = this.route.snapshot.queryParamMap.get('tail') ?? '';

    if (!this.configId) {
      this.router.navigate([LCC_BASE, 'aircraft-explorer']);
      return;
    }
    this.store.loadCabins(this.configId);
  }

  ngOnDestroy(): void {
    this.store.clearCabinState();
  }

  // ── Dark Mode ──────────────────────────────────────────────────────────
  protected toggleDarkMode(): void {
    const next = !this.isDarkMode();
    document.documentElement.classList.toggle('aoms-dark', next);
    this.isDarkMode.set(next);
  }

  // ── Navigation ─────────────────────────────────────────────────────────
  protected goBack(): void {
    if (this.tailNumber) {
      this.router.navigate([LCC_BASE, 'config-explorer', this.tailNumber]);
    } else {
      this.router.navigate([LCC_BASE, 'aircraft-explorer']);
    }
  }

  protected onDesignSeats(cabinClassId: number): void {
    this.store.openSeatMapArchitect(cabinClassId);
  }

  // ── Add Form ───────────────────────────────────────────────────────────
  protected onShowAddForm(): void {
    this.store.clearCabinActionError();
    this.showAddForm.set(true);
  }

  protected async onFormSubmitted(event: ICabinFormSubmitEvent): Promise<void> {
    const success = await this.store.addCabin(this.configId, event.name);
    if (success) this.showAddForm.set(false);
  }

  protected onFormCancelled(): void {
    this.showAddForm.set(false);
    this.store.clearCabinActionError();
  }

  // ── Delete Flow ────────────────────────────────────────────────────────
  protected onRemoveZone(cabinClassId: number): void {
    const zone = this.store.activeCabins().find(c => c.cabinClassId === cabinClassId);
    this.store.clearCabinActionError();
    this.pendingDeleteId.set(cabinClassId);
    this.pendingDeleteName.set(zone?.name ?? '');
    this.showDeleteModal.set(true);
  }

  protected async onDeleteConfirmed(): Promise<void> {
    const id = this.pendingDeleteId();
    if (!id) return;
    const success = await this.store.removeCabin(id);
    if (success) {
      this.showDeleteModal.set(false);
      this.pendingDeleteId.set(null);
    }
  }

  protected onDeleteCancelled(): void {
    this.showDeleteModal.set(false);
    this.pendingDeleteId.set(null);
    this.store.clearCabinActionError();
  }

  protected onDeleteErrorDismissed(): void {
    this.showDeleteModal.set(false);
    this.pendingDeleteId.set(null);
    this.store.clearCabinActionError();
  }
}