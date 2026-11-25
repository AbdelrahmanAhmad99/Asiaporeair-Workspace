

import {
    ChangeDetectionStrategy,
    Component,
    computed,
    input,
    output,
    signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
    ICrewComplianceFilters,
    RANK_OPTIONS,
    STATUS_OPTIONS,
    CrewRank,
    ComplianceStatus,
} from '../../store/crew-compliance.model';

@Component({
    selector: 'aoms-compliance-filter-panel',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, FormsModule],
    templateUrl: './compliance-filter-panel.component.html',
    styleUrl: './compliance-filter-panel.component.scss',
})
export class ComplianceFilterPanelComponent {

    // ── Inputs ────────────────────────────────────────────────────────────
    readonly filters = input.required<ICrewComplianceFilters>();
    readonly loading = input<boolean>(false);

    // ── Outputs ───────────────────────────────────────────────────────────
    readonly filtersChanged = output<Partial<ICrewComplianceFilters>>();
    readonly filtersReset = output<void>();

    // ── Static option arrays ──────────────────────────────────────────────
    protected readonly rankOptions = RANK_OPTIONS;
    protected readonly statusOptions = STATUS_OPTIONS;

    // ── Active filter count (computed from input signal) ──────────────────
    protected readonly activeFilterCount = computed<number>(() => {
        const f = this.filters();
        return [f.base, f.rank, f.complianceStatus, f.search]
            .filter(v => !!v).length;
    });

    protected readonly hasActiveFilters = computed<boolean>(
        () => this.activeFilterCount() > 0
    );

    // ── Event handlers ────────────────────────────────────────────────────
    protected onBaseInput(event: Event): void {
        const value = (event.target as HTMLInputElement).value.trim().toUpperCase();
        this.filtersChanged.emit({ base: value });
    }

    protected onRankChange(event: Event): void {
        const value = (event.target as HTMLSelectElement).value as CrewRank;
        this.filtersChanged.emit({ rank: value });
    }

    protected onStatusChange(event: Event): void {
        const value = (event.target as HTMLSelectElement).value as ComplianceStatus;
        this.filtersChanged.emit({ complianceStatus: value });
    }

    protected onSearchInput(event: Event): void {
        const value = (event.target as HTMLInputElement).value;
        this.filtersChanged.emit({ search: value });
    }

    protected onReset(): void {
        this.filtersReset.emit();
    }
}
