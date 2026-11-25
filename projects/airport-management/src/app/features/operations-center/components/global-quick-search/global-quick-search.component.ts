import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';

import {
  RoutableSearchKind,
  SEARCH_DESTINATIONS,
  SearchSuggestion,
} from '../../models/command-bar.models';
import {
  AirborneFlightMarker,
  SearchTargetKind,
} from '../../models/operations-center.models';
import { classifySearchQuery } from '../../store/operations-center.store';

const MAX_LIVE_MATCHES = 5;
const MIN_LIVE_MATCH_LENGTH = 2;
const HINT_ORDER: readonly RoutableSearchKind[] = [
  SearchTargetKind.FLIGHT_NUMBER,
  SearchTargetKind.TAIL_NUMBER,
  SearchTargetKind.PNR,
  SearchTargetKind.CREW_ID,
];

export interface SearchFormatHint {
  readonly kind: RoutableSearchKind;
  readonly entityLabel: string;
  readonly example: string;
  readonly destinationLabel: string;
}

const SEARCH_FORMAT_HINTS: readonly SearchFormatHint[] = HINT_ORDER.map((kind) => ({
  kind,
  entityLabel: SEARCH_DESTINATIONS[kind].entityLabel,
  example: SEARCH_DESTINATIONS[kind].example,
  destinationLabel: SEARCH_DESTINATIONS[kind].label,
}));

let nextSearchInstanceId = 0;

const formatFlightLevel = (altitudeFt: number): string =>
  `FL${Math.round(altitudeFt / 100).toString().padStart(3, '0')}`;

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
}


@Component({
  selector: 'aoms-global-quick-search',
  templateUrl: './global-quick-search.component.html',
  styleUrl: './global-quick-search.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown)': 'onDocumentKeydown($event)',
    '(document:pointerdown)': 'onDocumentPointerDown($event)',
  },
})
export class GlobalQuickSearchComponent {
  /** Live airborne fleet, used for instant previews while typing. */
  readonly fleet = input<readonly AirborneFlightMarker[]>([]);
  readonly placeholder = input('Search flight, tail, PNR or crew ID');

  /** Emits a query the store can classify. PNRs carry an explicit `PNR:` prefix to avoid ambiguity. */
  readonly searchSubmitted = output<string>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly inputRef = viewChild.required<ElementRef<HTMLInputElement>>('searchInput');

  private readonly instanceId = nextSearchInstanceId++;
  protected readonly inputId = `aoms-search-input-${this.instanceId}`;
  protected readonly listboxId = `aoms-search-listbox-${this.instanceId}`;
  protected readonly hintsId = `aoms-search-hints-${this.instanceId}`;

  protected readonly formatHints = SEARCH_FORMAT_HINTS;
  protected readonly shortcutLabel =
    typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.userAgent) ? '⌘ K' : 'Ctrl K';

  protected readonly query = signal('');
  protected readonly isOpen = signal(false);
  private readonly requestedIndex = signal(0);

  private readonly classification = computed(() => classifySearchQuery(this.query()));

  /** Primary "open in…" row first, then live airborne matches. */
  protected readonly suggestions = computed<readonly SearchSuggestion[]>(() => {
    const classified = this.classification();
    if (classified === null) return [];

    const live: SearchSuggestion[] = [];
    if (classified.normalized.length >= MIN_LIVE_MATCH_LENGTH) {
      for (const marker of this.fleet()) {
        if (live.length >= MAX_LIVE_MATCHES) break;
        const byFlight = marker.flightNumber.startsWith(classified.normalized);
        const byTail = !byFlight && marker.tailNumber.startsWith(classified.normalized);
        if (!byFlight && !byTail) continue;

        const kind: RoutableSearchKind = byFlight ? SearchTargetKind.FLIGHT_NUMBER : SearchTargetKind.TAIL_NUMBER;
        const value = byFlight ? marker.flightNumber : marker.tailNumber;
        live.push({
          id: `live-${kind}-${value}`,
          kind,
          value,
          title: value,
          destinationLabel: SEARCH_DESTINATIONS[kind].label,
          detail: `${marker.origin} to ${marker.destination}, ${formatFlightLevel(marker.altitudeFt)}, ${Math.round(marker.groundSpeedKts)} kt`,
          isLive: true,
        });
      }
    }

    if (classified.kind === SearchTargetKind.UNKNOWN) return live;

    // An exact live match is richer than the generic row, so it replaces it.
    if (live.some((s) => s.kind === classified.kind && s.value === classified.normalized)) return live;

    const destination = SEARCH_DESTINATIONS[classified.kind];
    const primary: SearchSuggestion = {
      id: `go-${classified.kind}-${classified.normalized}`,
      kind: classified.kind,
      value: classified.normalized,
      title: `${destination.entityLabel} ${classified.normalized}`,
      destinationLabel: destination.label,
      detail: '',
      isLive: false,
    };
    return [primary, ...live];
  });

  protected readonly hasSuggestions = computed(() => this.suggestions().length > 0);
  protected readonly showHints = computed(() => !this.hasSuggestions());

  /** Clamped so a shrinking live list can never leave the highlight out of range. */
  protected readonly highlightedIndex = computed(() =>
    Math.min(this.requestedIndex(), Math.max(0, this.suggestions().length - 1)),
  );

  protected readonly activeDescendant = computed(() =>
    this.isOpen() && this.hasSuggestions() ? this.optionId(this.highlightedIndex()) : null,
  );

  protected optionId(index: number): string {
    return `${this.listboxId}-opt-${index}`;
  }

  // ── Input & keyboard handling ──────────────────────────────────────────────

  protected open(): void {
    this.isOpen.set(true);
  }

  protected onInput(event: Event): void {
    if (!(event.target instanceof HTMLInputElement)) return;
    this.query.set(event.target.value);
    this.requestedIndex.set(0);
    this.isOpen.set(true);
  }

  protected onInputKeydown(event: KeyboardEvent): void {
    const count = this.suggestions().length;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.isOpen.set(true);
        if (count > 0) this.requestedIndex.set((this.highlightedIndex() + 1) % count);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.isOpen.set(true);
        if (count > 0) this.requestedIndex.set((this.highlightedIndex() - 1 + count) % count);
        break;
      case 'Enter': {
        const target = this.suggestions()[this.highlightedIndex()];
        if (target !== undefined) {
          event.preventDefault();
          this.select(target);
        }
        break;
      }
      case 'Escape':
        event.preventDefault();
        if (this.isOpen()) {
          this.isOpen.set(false);
        } else {
          this.clear();
          this.inputRef().nativeElement.blur();
        }
        break;
      default:
        break;
    }
  }

  protected highlight(index: number): void {
    this.requestedIndex.set(index);
  }

  protected select(suggestion: SearchSuggestion): void {
    this.searchSubmitted.emit(suggestion.kind === SearchTargetKind.PNR ? `PNR:${suggestion.value}` : suggestion.value);
    this.clear();
    this.isOpen.set(false);
    this.inputRef().nativeElement.blur();
  }

  protected clear(): void {
    this.query.set('');
    this.requestedIndex.set(0);
  }

  protected clearAndRefocus(): void {
    this.clear();
    this.inputRef().nativeElement.focus();
  }

  // ── Document-level handlers (host-bound, so public) ────────────────────────

  onDocumentKeydown(event: KeyboardEvent): void {
    const isChord = (event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === 'k';
    const isSlash =
      event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey && !isEditableTarget(event.target);
    if (!isChord && !isSlash) return;

    event.preventDefault(); // Firefox binds Ctrl+K to its search bar.
    const field = this.inputRef().nativeElement;
    field.focus();
    field.select();
    this.isOpen.set(true);
  }

  onDocumentPointerDown(event: PointerEvent): void {
    if (this.isOpen() && event.target instanceof Node && !this.host.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }
}