
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  animate,
  style,
  transition,
  trigger,
} from '@angular/animations';

import { CabinDesignerStore } from '../../store/cabin-designer.store';
import { VisualSeatGridComponent } from '../../components/visual-seat-grid/visual-seat-grid.component';
import { SeatPropertyEditorComponent } from '../../components/seat-property-editor/seat-property-editor.component';
import {
  ISeatViewModel,
  CabinClassType,
  CABIN_CLASS_VISUALS,
} from '../../store/cabin-designer.store';
import { ISeatSpecUpdate } from '../../components/seat-property-editor/seat-property-editor.component';

const LCC_BASE = 'aoms/fleet-configuration/cabin-configuration-designer';

// ── Sidebar slide-in animation ────────────────────────────────────────────
const SMA_ANIMATIONS = [
  trigger('sidebarSlide', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateX(24px)' }),
      animate('300ms cubic-bezier(0.16,1,0.3,1)',
        style({ opacity: 1, transform: 'translateX(0)' })),
    ]),
    transition(':leave', [
      animate('200ms ease-in',
        style({ opacity: 0, transform: 'translateX(20px)' })),
    ]),
  ]),
  trigger('pageEnter', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateY(12px)' }),
      animate('400ms 60ms cubic-bezier(0.16,1,0.3,1)',
        style({ opacity: 1, transform: 'translateY(0)' })),
    ]),
  ]),
];

@Component({
  selector: 'aoms-seat-map-architect',
  standalone: true,
  imports: [
    CommonModule,
    VisualSeatGridComponent,
    SeatPropertyEditorComponent,
  ],
  animations: SMA_ANIMATIONS,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './seat-map-architect.component.html',
  styleUrl: './seat-map-architect.component.scss',
})
export class SeatMapArchitectComponent implements OnInit, OnDestroy {
  protected readonly store = inject(CabinDesignerStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  // ── Route Params ───────────────────────────────────────────────────────
  protected cabinId = 0;
  protected configId = 0;
  protected cabinName = '';

  // ── UI State ───────────────────────────────────────────────────────────
  protected readonly hoveredSeatId = signal<string | null>(null);
  protected readonly showDeleteModal = signal<boolean>(false);
  protected readonly pendingDeleteId = signal<string | null>(null);
  protected readonly isDarkMode = signal<boolean>(
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('aoms-dark')
  );

  // ── Derived ────────────────────────────────────────────────────────────
  protected readonly cabinType = computed<CabinClassType>(() => {
    const name = this.cabinName.toLowerCase();
    if (name.includes('suite')) return 'suites';
    if (name.includes('first')) return 'first';
    if (name.includes('business')) return 'business';
    if (name.includes('premium')) return 'premium-economy';
    if (name.includes('economy') || name.includes('eco')) return 'economy';
    return 'economy';
  });

  protected readonly cabinVisual = computed(() =>
    CABIN_CLASS_VISUALS[this.cabinType()]
  );

  // ── Lifecycle ──────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.cabinId = parseInt(this.route.snapshot.paramMap.get('cabinId') ?? '0', 10);
    this.configId = parseInt(this.route.snapshot.queryParamMap.get('configId') ?? '0', 10);
    this.cabinName = this.route.snapshot.queryParamMap.get('name') ?? '';

    if (!this.cabinId) {
      this.router.navigate([LCC_BASE, 'aircraft-explorer']);
      return;
    }
    this.store.fetchSeatMap(this.cabinId);
  }

  ngOnDestroy(): void {
    this.store.clearSeatMapState();
  }

  // ── Dark Mode ──────────────────────────────────────────────────────────
  protected toggleDarkMode(): void {
    const next = !this.isDarkMode();
    document.documentElement.classList.toggle('aoms-dark', next);
    this.isDarkMode.set(next);
  }

  // ── Navigation ─────────────────────────────────────────────────────────
  protected goBack(): void {
    if (this.configId) {
      this.router.navigate([LCC_BASE, 'cabin-builder', this.configId]);
    } else {
      this.router.navigate([LCC_BASE, 'aircraft-explorer']);
    }
  }

  // ── Canvas Interactions ────────────────────────────────────────────────
  protected onSeatSelected(seat: ISeatViewModel): void {
    const already = this.store.selectedSeat();
    if (already?.seatId === seat.seatId) {
      // Deselect on second click
      this.store.selectSeat(null);
    } else {
      this.store.selectSeat(seat);
      this.store.clearSeatSaveMessages();
    }
  }

  protected onSeatHovered(seat: ISeatViewModel | null): void {
    this.hoveredSeatId.set(seat?.seatId ?? null);
  }

  protected onEmptyClicked(location: { row: number; col: string }): void {
    if (!this.cabinId) return;
    this.store.addNewSeat(this.cabinId, location);
  }

  protected onPanelClosed(): void {
    this.store.selectSeat(null);
    this.store.clearSeatSaveMessages();
  }

  // ── Seat Property Changes ──────────────────────────────────────────────
  protected async onSpecsApplied(update: ISeatSpecUpdate): Promise<void> {
    await this.store.commitSeatUpdate(update.seatId, {
      isWindow: update.isWindow,
      isExitRow: update.isExitRow,
      isAisle: update.isAisle,
      cabinClassId: update.cabinClassId,
    });
  }

  // ── Delete Flow ────────────────────────────────────────────────────────
  protected onDeleteRequested(seatId: string): void {
    this.pendingDeleteId.set(seatId);
    this.showDeleteModal.set(true);
  }

  protected async onDeleteConfirmed(): Promise<void> {
    const id = this.pendingDeleteId();
    if (!id) return;
    const ok = await this.store.removeSeat(id);
    if (ok) {
      this.showDeleteModal.set(false);
      this.pendingDeleteId.set(null);
    }
    // Error kept in store.seatSaveError → shown in modal
  }

  protected onDeleteCancelled(): void {
    this.showDeleteModal.set(false);
    this.pendingDeleteId.set(null);
    this.store.clearSeatSaveMessages();
  }

  // ── Template Helpers ───────────────────────────────────────────────────
  protected readonly pendingSeatNumber = computed(() => {
    const id = this.pendingDeleteId();
    if (!id) return '';
    return this.store.currentSeatMap().find(s => s.seatId === id)?.seatNumber ?? id;
  });
}