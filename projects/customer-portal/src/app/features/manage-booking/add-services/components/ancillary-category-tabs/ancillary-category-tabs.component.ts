// ancillary-category-tabs.component.ts
import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AncillaryCategory } from '../../../store/manage-booking.store';

const CATEGORY_LABELS: Record<string, string> = {
    All: 'All',
    DINING: 'Dining', MEAL: 'Dining',
    BAGGAGE: 'Baggage',
    COMFORT: 'Comfort', AMENITY: 'Comfort',
    LOUNGE: 'Lounge',
    CONNECTIVITY: 'Wi-Fi', ENTERTAINMENT: 'Entertainment',
    MEDICAL: 'Medical', SPECIAL_ASSIST: 'Assistance',
    PETS: 'Pets', PRIORITY: 'Priority', UPGRADE: 'Upgrade',
    INSURANCE: 'Insurance', Other: 'Other'
};

const CATEGORY_ICONS: Record<string, string> = {
    All: 'grid', Dining: 'meal', Baggage: 'baggage', Comfort: 'seat',
    Lounge: 'lounge', Connectivity: 'wifi', Medical: 'medical', Other: 'star'
};

@Component({
    selector: 'app-ancillary-category-tabs',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule],
    templateUrl: './ancillary-category-tabs.component.html',
    styleUrl: './ancillary-category-tabs.component.scss',
})
export class AncillaryCategoryTabsComponent {
    @Input({ required: true }) categories!: (AncillaryCategory | 'All')[];
    @Input() activeCategory: AncillaryCategory | 'All' = 'All';
    @Output() categoryChange = new EventEmitter<AncillaryCategory | 'All'>();

    getLabel(cat: string): string { return CATEGORY_LABELS[cat] ?? cat; }

    getIconSvg(cat: string): string {
        const c = cat.toUpperCase();
        const icons: Record<string, string> = {
            ALL: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>`,
            DINING: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/></svg>`,
            MEAL: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/></svg>`,
            BAGGAGE: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect x="6" y="8" width="12" height="13" rx="2"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>`,
            COMFORT: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M6 3v11M18 3v11"/><path d="M6 14a4 4 0 0 0 4 4h4a4 4 0 0 0 4-4"/></svg>`,
            AMENITY: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M6 3v11M18 3v11"/><path d="M6 14a4 4 0 0 0 4 4h4a4 4 0 0 0 4-4"/></svg>`,
            LOUNGE: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>`,
            CONNECTIVITY: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>`,
            ENTERTAINMENT: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>`,
            MEDICAL: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`,
            SPECIAL_ASSIST: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`,
        };
        return icons[c] ?? icons['OTHER'] ?? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
    }
}