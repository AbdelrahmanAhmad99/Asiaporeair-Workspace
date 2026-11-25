
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { FareEngineStore } from '../../store/fare-engine.store';
import { FareAuditTableComponent } from '../../components/fare-audit-table/fare-audit-table.component';
import { FareReactivationModalComponent } from '../../components/fare-reactivation-modal/fare-reactivation-modal.component';
import { IFareBasisCodeDto } from '@shared-core';

@Component({
  selector: 'aoms-fare-audit-archive',
  standalone: true,
  imports: [
    CommonModule,
    FareAuditTableComponent,
    FareReactivationModalComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './fare-audit-archive.component.html',
  styleUrl: './fare-audit-archive.component.scss',
})
export class FareAuditArchiveComponent implements OnInit, OnDestroy {
  protected readonly store = inject(FareEngineStore);

  // ── Reactivation modal state ──────────────────────────────────────────
  protected readonly showReactivationModal = signal<boolean>(false);
  protected readonly pendingReactivateCode = signal<string | null>(null);
  protected readonly pendingReactivateDesc = signal<string>('');

  // ── Dark mode ─────────────────────────────────────────────────────────
  protected readonly isDarkMode = signal<boolean>(
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('aoms-dark')
  );

  // ── Lifecycle ─────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.store.loadAuditArchive();
  }

  ngOnDestroy(): void {
    this.store.clearAuditState();
  }

  // ── Dark Mode ─────────────────────────────────────────────────────────
  protected toggleDarkMode(): void {
    const next = !this.isDarkMode();
    document.documentElement.classList.toggle('aoms-dark', next);
    this.isDarkMode.set(next);
  }

  // ── Refresh ───────────────────────────────────────────────────────────
  protected onRefresh(): void {
    this.store.loadAuditArchive();
  }

  // ── Reactivation Flow ─────────────────────────────────────────────────
  protected onReactivateRequested(fare: IFareBasisCodeDto): void {
    this.pendingReactivateCode.set(fare.code);
    this.pendingReactivateDesc.set(fare.description || fare.code);
    this.store.clearAuditState();
    this.showReactivationModal.set(true);
  }

  protected async onReactivationConfirmed(): Promise<void> {
    const code = this.pendingReactivateCode();
    if (!code) return;
    const ok = await this.store.reactivateArchivedFare(code);
    if (ok) {
      this.showReactivationModal.set(false);
      this.pendingReactivateCode.set(null);
    }
  }

  protected onReactivationCancelled(): void {
    this.showReactivationModal.set(false);
    this.pendingReactivateCode.set(null);
    this.store.clearAuditState();
  }

  // ── Navigation ────────────────────────────────────────────────────────
  protected onGoToInventory(): void {
    this.store.navigateToInventory();
  }

  protected onGoToConfigurator(): void {
    this.store.navigateToConfigurator();
  }
}