

import {
    ChangeDetectionStrategy,
    Component,
    computed,
    input,
    output,
    signal,
    ElementRef,
    HostListener,
    inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IAirportDto } from '@shared-core';

@Component({
    selector: 'aoms-crew-base-manager',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, FormsModule],
    templateUrl: './crew-base-manager.component.html',
    styleUrl: './crew-base-manager.component.scss',
})
export class CrewBaseManagerComponent {

    // ── Inputs ────────────────────────────────────────────────────────────
    readonly currentBase = input.required<string>();
    readonly airports = input<IAirportDto[]>([]);
    readonly isProcessing = input<boolean>(false);
    readonly isLoading = input<boolean>(false);

    // ── Output ────────────────────────────────────────────────────────────
    readonly baseUpdated = output<string>();

    // ── ElementRef for click-outside detection ────────────────────────────
    private readonly elRef = inject(ElementRef);

    // ── Local UI state ────────────────────────────────────────────────────
    protected readonly searchQuery = signal<string>('');
    protected readonly selectedIata = signal<string>('');
    protected readonly justSaved = signal<boolean>(false);

    // ── Dropdown open/close ───────────────────────────────────────────────
    protected readonly isOpen = signal<boolean>(false);

    /** Close dropdown when clicking outside this component. */
    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent): void {
        if (!this.elRef.nativeElement.contains(event.target)) {
            this.closeDropdown();
        }
    }

    // ── Computed: filtered airport list ──────────────────────────────────
    protected readonly filteredAirports = computed<IAirportDto[]>(() => {
        const q = this.searchQuery().toLowerCase().trim();
        const airports = this.airports();
        if (!q) return airports;
        return airports.filter(a =>
            a.iataCode.toLowerCase().includes(q) ||
            a.name.toLowerCase().includes(q) ||
            a.city.toLowerCase().includes(q)
        );
    });

    /** True when the selected airport differs from the current base. */
    protected readonly hasChange = computed<boolean>(() => {
        const sel = this.selectedIata();
        return !!sel && sel !== this.currentBase();
    });

    /** Display label for currently selected airport. */
    protected readonly selectedLabel = computed<string>(() => {
        const iata = this.selectedIata() || this.currentBase();
        if (!iata) return '— Select Base —';
        const found = this.airports().find(a => a.iataCode === iata);
        return found ? `${found.iataCode} — ${found.name}` : iata;
    });

    protected toggleDropdown(): void {
        if (this.isProcessing() || this.isLoading()) return;
        this.isOpen.update(v => !v);
        if (!this.isOpen()) this.searchQuery.set('');
    }

    protected closeDropdown(): void {
        this.isOpen.set(false);
        this.searchQuery.set('');
    }

    protected onSearchInput(event: Event): void {
        this.searchQuery.set((event.target as HTMLInputElement).value);
    }

    protected selectAirport(iata: string): void {
        this.selectedIata.set(iata);
        this.closeDropdown();
    }

    // ── Authorize Base Update ─────────────────────────────────────────────
    protected authorizeUpdate(): void {
        const iata = this.selectedIata();
        if (!iata || !this.hasChange()) return;

        this.baseUpdated.emit(iata);
        this.justSaved.set(true);
        setTimeout(() => this.justSaved.set(false), 2000);
    }

    // ── Track ─────────────────────────────────────────────────────────────
    protected trackByIata(_: number, a: IAirportDto): string {
        return a.iataCode;
    }
}
