

import {
    ChangeDetectionStrategy,
    Component,
    input,
    output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    animate, query, stagger, style, transition, trigger,
} from '@angular/animations';
import {
    ICrewComplianceMember,
    ICrewCompliancePagination,
    ComplianceStatus,
} from '../../store/crew-compliance.model';

// ── Animation ─────────────────────────────────────────────────────────────
export const gridRowAnimation = trigger('gridRows', [
    transition('* => *', [
        query(':enter', [
            style({ opacity: 0, transform: 'translateY(10px)' }),
            stagger(24, [
                animate(
                    '280ms cubic-bezier(0.4,0,0.2,1)',
                    style({ opacity: 1, transform: 'translateY(0)' })
                ),
            ]),
        ], { optional: true }),
    ]),
]);

// ── Rank icon SVG paths ───────────────────────────────────────────────────
interface IRankConfig {
    label: string;
    iconPath: string;
    cssClass: string;
}

const RANK_ICON_MAP: Record<string, IRankConfig> = {
    captain: {
        label: 'Captain',
        iconPath: 'M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5z',
        cssClass: 'rank--captain',
    },
    firstofficer: {
        label: 'First Officer',
        iconPath: 'M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12zm0 0h7.5',
        cssClass: 'rank--firstofficer',
    },
    leadpurser: {
        label: 'Lead Purser',
        iconPath: 'M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0zM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632z',
        cssClass: 'rank--leadpurser',
    },
    seniorpurser: {
        label: 'Senior Purser',
        iconPath: 'M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0zM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632z',
        cssClass: 'rank--seniorpurser',
    },
    flightsteward: {
        label: 'Flight Steward',
        iconPath: 'M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0zM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632z',
        cssClass: 'rank--flightsteward',
    },
};

const FALLBACK_RANK_CONFIG: IRankConfig = {
    label: 'Crew',
    iconPath: 'M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
    cssClass: 'rank--default',
};

@Component({
    selector: 'aoms-crew-technical-grid',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule],
    animations: [gridRowAnimation],
    templateUrl: './crew-technical-grid.component.html',
    styleUrl: './crew-technical-grid.component.scss',
})
export class CrewTechnicalGridComponent {

    // ── Inputs ────────────────────────────────────────────────────────────
    readonly crewMembers = input.required<ICrewComplianceMember[]>();
    readonly pagination = input<ICrewCompliancePagination | null>(null);
    readonly pageNumbers = input<number[]>([]);
    readonly loading = input<boolean>(false);

    // ── Outputs ───────────────────────────────────────────────────────────
    readonly viewProfileClicked = output<number>();  // employeeId
    readonly nextPage = output<void>();
    readonly prevPage = output<void>();
    readonly pageChanged = output<number>();

    // ── Shimmer skeleton rows for loading state ───────────────────────────
    protected readonly shimmerRows = Array(8).fill(null);

    // ── Rank config lookup ────────────────────────────────────────────────
    protected rankConfig(rank: string): IRankConfig {
        const key = rank.toLowerCase().replace(/\s+/g, '');
        return RANK_ICON_MAP[key] ?? FALLBACK_RANK_CONFIG;
    }

    // ── Status badge CSS class lookup ─────────────────────────────────────
    protected statusClass(status: ComplianceStatus): string {
        const map: Record<ComplianceStatus, string> = {
            Compliant: 'badge--compliant',
            Warning: 'badge--warning',
            NonCompliant: 'badge--noncompliant',
            '': 'badge--unknown',
        };
        return map[status] ?? 'badge--unknown';
    }

    protected statusLabel(status: ComplianceStatus): string {
        const map: Record<ComplianceStatus, string> = {
            Compliant: 'Compliant',
            Warning: 'Warning',
            NonCompliant: 'Non-Compliant',
            '': 'Unknown',
        };
        return map[status] ?? 'Unknown';
    }

    // ── Avatar initials ───────────────────────────────────────────────────
    protected initials(member: ICrewComplianceMember): string {
        const first = (member.firstName || '').charAt(0);
        const last = (member.lastName || '').charAt(0);
        if (!first && !last) return '??';
        return (first + last).toUpperCase();
    }

    // ── Track by for ngFor performance ────────────────────────────────────
    protected trackByMember(_: number, m: ICrewComplianceMember): number {
        return m.employeeId;
    }

    // ── Pagination helpers ────────────────────────────────────────────────
    protected get startIndex(): number {
        const p = this.pagination();
        if (!p) return 0;
        return (p.page - 1) * p.size + 1;
    }

    protected get endIndex(): number {
        const p = this.pagination();
        if (!p) return 0;
        return Math.min(p.page * p.size, p.total);
    }

    protected isEllipsis(n: number): boolean {
        return n < 0;
    }
}
