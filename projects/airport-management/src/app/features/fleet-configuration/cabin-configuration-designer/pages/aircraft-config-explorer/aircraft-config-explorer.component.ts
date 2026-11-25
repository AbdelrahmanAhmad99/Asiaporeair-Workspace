
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
import { ConfigActionToolbarComponent } from '../../components/config-action-toolbar/config-action-toolbar.component';
import { ConfigVersionCardComponent } from '../../components/config-version-card/config-version-card.component';
import { ConfigDeleteModalComponent } from '../../components/config-delete-modal/config-delete-modal.component';
import { ConfigEmptyStateComponent } from '../../components/config-empty-state/config-empty-state.component';

// ── Staggered card entry animation ────────────────────────────────────────
export const cardGridAnimation = trigger('cardGrid', [
  transition('* => *', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(16px) scale(0.97)' }),
      stagger(60, [
        animate(
          '320ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({ opacity: 1, transform: 'translateY(0) scale(1)' })
        ),
      ]),
    ], { optional: true }),
  ]),
]);

const LCC_BASE = 'aoms/fleet-configuration/cabin-configuration-designer';

@Component({
  selector: 'aoms-aircraft-config-explorer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ConfigActionToolbarComponent,
    ConfigVersionCardComponent,
    ConfigDeleteModalComponent,
    ConfigEmptyStateComponent,
  ],
  animations: [cardGridAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './aircraft-config-explorer.component.html',
  styleUrl: './aircraft-config-explorer.component.scss',
})
export class AircraftConfigExplorerComponent implements OnInit, OnDestroy {
  protected readonly store = inject(CabinDesignerStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected tailNumber = '';

  // ── Delete Modal ───────────────────────────────────────────────────────
  protected readonly showDeleteModal = signal<boolean>(false);
  protected readonly pendingDeleteId = signal<number | null>(null);
  protected readonly pendingDeleteName = signal<string>('');

  // ── New Config Inline Form ─────────────────────────────────────────────
  protected readonly showNewForm = signal<boolean>(false);
  protected newConfigName = '';
  protected newConfigSeats = '';
  protected isCreatingConfig = signal<boolean>(false);
  protected createError = signal<string | null>(null);

  // ── Lifecycle ──────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.tailNumber = this.route.snapshot.paramMap.get('tailNumber') ?? '';
    if (!this.tailNumber) {
      this.router.navigate([LCC_BASE, 'aircraft-explorer']);
      return;
    }
    this.store.getConfigs(this.tailNumber);
  }

  ngOnDestroy(): void {
    this.store.clearConfigState();
  }

  // ── Navigation ─────────────────────────────────────────────────────────
  protected navigateToExplorer(): void {
    this.router.navigate([LCC_BASE, 'aircraft-explorer']);
  }

  protected onOpenWorkspace(configId: number): void {
    this.store.openWorkspace(configId);
  }

  // ── Search ─────────────────────────────────────────────────────────────
  protected onSearchChanged(query: string): void {
    this.store.setConfigFilter(query);
  }

  // ── Delete Flow ────────────────────────────────────────────────────────
  protected onDeleteClicked(configId: number): void {
    const cfg = this.store.configurations().find(c => c.configId === configId);
    this.pendingDeleteId.set(configId);
    this.pendingDeleteName.set(cfg?.configurationName ?? '');
    this.store.clearDeleteError();
    this.showDeleteModal.set(true);
  }

  protected async onDeleteConfirmed(): Promise<void> {
    const id = this.pendingDeleteId();
    if (!id) return;
    const result = await this.store.removeConfig(id);
    if (result.success) {
      this.showDeleteModal.set(false);
      this.pendingDeleteId.set(null);
    }
    // Error — modal stays open, error state shown via store.deleteError()
  }

  protected onDeleteCancelled(): void {
    this.showDeleteModal.set(false);
    this.pendingDeleteId.set(null);
    this.store.clearDeleteError();
  }

  protected onDeleteErrorDismissed(): void {
    this.showDeleteModal.set(false);
    this.pendingDeleteId.set(null);
    this.store.clearDeleteError();
  }

  // ── Duplicate ──────────────────────────────────────────────────────────
  protected async onDuplicateClicked(configId: number): Promise<void> {
    await this.store.duplicateConfig(configId);
  }

  // ── New Configuration ─────────────────────────────────────────────────
  protected onNewConfig(): void {
    this.newConfigName = '';
    this.newConfigSeats = '';
    this.createError.set(null);
    this.showNewForm.set(true);
  }

  protected async onCreateConfig(): Promise<void> {
    if (!this.newConfigName.trim()) {
      this.createError.set('Configuration name is required.');
      return;
    }
    const seats = parseInt(this.newConfigSeats, 10);
    if (isNaN(seats) || seats < 1) {
      this.createError.set('Enter a valid total seat count.');
      return;
    }

    this.isCreatingConfig.set(true);
    this.createError.set(null);

    try {
      const svc = (this.store as unknown as {
        aircraftService: { createAircraftConfig: (t: string, d: { configurationName: string; totalSeatsCount: number }) => import('rxjs').Observable<unknown> }
      }).aircraftService;

      svc.createAircraftConfig(this.tailNumber, {
        configurationName: this.newConfigName.trim(),
        totalSeatsCount: seats,
      }).subscribe({
        next: () => {
          this.isCreatingConfig.set(false);
          this.showNewForm.set(false);
          this.store.getConfigs(this.tailNumber); // reload
        },
        error: (err: { error?: { message?: string }; message?: string }) => {
          this.createError.set(err?.error?.message ?? err?.message ?? 'Failed to create configuration.');
          this.isCreatingConfig.set(false);
        },
      });
    } catch {
      // Fallback: let store handle it
      this.isCreatingConfig.set(false);
    }
  }

  protected onCancelNewForm(): void {
    this.showNewForm.set(false);
    this.createError.set(null);
  }
}