

import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    animate,
    style,
    transition,
    trigger,
} from '@angular/animations';

import { CrewComplianceStore } from '../../store/crew-compliance.store';
import { ICrewComplianceFilters } from '../../store/crew-compliance.model';
import { ComplianceFilterPanelComponent } from '../../components/compliance-filter-panel/compliance-filter-panel.component';
import { CrewTechnicalGridComponent } from '../../components/crew-technical-grid/crew-technical-grid.component';

// ── Animation: Ruby Red error banner fade ─────────────────────────────────
export const bannerAnimation = trigger('bannerAnim', [
    transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-16px)', maxHeight: '0' }),
        animate(
            '320ms cubic-bezier(0.4, 0, 0.2, 1)',
            style({ opacity: 1, transform: 'translateY(0)', maxHeight: '120px' })
        ),
    ]),
    transition(':leave', [
        animate(
            '220ms ease-in',
            style({ opacity: 0, transform: 'translateY(-8px)', maxHeight: '0' })
        ),
    ]),
]);

// ── Animation: Page content fade-in ──────────────────────────────────────
export const pageAnimation = trigger('pageAnim', [
    transition(':enter', [
        style({ opacity: 0, transform: 'translateY(12px)' }),
        animate(
            '400ms 80ms cubic-bezier(0.4, 0, 0.2, 1)',
            style({ opacity: 1, transform: 'translateY(0)' })
        ),
    ]),
]);

@Component({
    selector: 'aoms-crew-operational-directory',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        ComplianceFilterPanelComponent,
        CrewTechnicalGridComponent,
    ],
    animations: [bannerAnimation, pageAnimation],
    templateUrl: './crew-operational-directory.component.html',
    styleUrl: './crew-operational-directory.component.scss',
})
export class CrewOperationalDirectoryComponent implements OnInit {

    // ── Store injection ────────────────────────────────────────────────
    protected readonly store = inject(CrewComplianceStore);

    // ── Expose store read-only signals to template ─────────────────────
    protected readonly crewMembers = this.store.crewMembers;
    protected readonly pagination = this.store.paginationMetadata;
    protected readonly activeFilters = this.store.activeFilters;
    protected readonly isLoading = this.store.isLoading;
    protected readonly operationalError = this.store.operationalError;
    protected readonly pageNumbers = this.store.pageNumbers;
    protected readonly hasActiveFilters = this.store.hasActiveFilters;

    // ── Lifecycle ─────────────────────────────────────────────────────
    ngOnInit(): void {
        this.store.loadCrewMembers(1);
    }

    // ── Filter events ─────────────────────────────────────────────────
    protected onFiltersChanged(newFilters: Partial<ICrewComplianceFilters>): void {
        this.store.updateFilters(newFilters);
    }

    protected onFiltersReset(): void {
        this.store.resetFilters();
    }

    // ── Pagination events ──────────────────────────────────────────────
    protected onNextPage(): void {
        this.store.nextPage();
    }

    protected onPrevPage(): void {
        this.store.prevPage();
    }

    protected onPageChanged(page: number): void {
        this.store.goToPage(page);
    }

    // ── Navigation events ──────────────────────────────────────────────
    protected onViewProfile(employeeId: number): void {
        this.store.navigateToTechnicalProfile(employeeId);
    }

    protected onNavigateToWatchdog(): void {
        this.store.navigateToWatchdogCenter();
    }

    // ── Error handling ─────────────────────────────────────────────────
    protected dismissError(): void {
        this.store.clearError();
    }

    // ── Computed display helpers ───────────────────────────────────────
    protected get currentTimestamp(): string {
        return new Date().toLocaleString('en-SG', {
            hour12: false,
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            timeZoneName: 'short',
        });
    }
}
