
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AIRCRAFT_STATUS } from '../../store/fleet-inventory.store';

const REASON_REQUIRED_STATUSES: string[] = [AIRCRAFT_STATUS.GROUNDED, AIRCRAFT_STATUS.AOG];
const REASON_MAX_CHARS = 300;

interface IStatusOption {
  value: string;
  label: string;
  description: string;
}

const STATUS_OPTIONS: IStatusOption[] = [
  { value: AIRCRAFT_STATUS.ACTIVE, label: 'Operational', description: 'Aircraft is cleared for service' },
  { value: AIRCRAFT_STATUS.MAINTENANCE, label: 'Maintenance', description: 'Scheduled or unscheduled service' },
  { value: AIRCRAFT_STATUS.GROUNDED, label: 'Grounded', description: 'Temporarily taken out of service' },
  { value: AIRCRAFT_STATUS.AOG, label: 'AOG — Critical', description: 'Aircraft on ground, critical issue' },
  { value: AIRCRAFT_STATUS.RESERVE, label: 'Reserve', description: 'Available as operational reserve' },
];

export interface IStatusChangeEvent {
  status: string;
  reason?: string;
}

@Component({
  selector: 'aoms-status-management-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './status-management-form.component.html',
  styleUrl: './status-management-form.component.scss',
})
export class StatusManagementFormComponent {
  // ── Inputs ──────────────────────────────────────────────────────────────
  readonly currentStatus = input<string>('');
  readonly isProcessing = input<boolean>(false);

  // ── Output ──────────────────────────────────────────────────────────────
  readonly statusChanged = output<IStatusChangeEvent>();

  // ── Local State ──────────────────────────────────────────────────────────
  protected readonly selectedStatus = signal<string>('');
  protected readonly reason = signal<string>('');
  protected readonly statusOptions = STATUS_OPTIONS;
  protected readonly REASON_MAX = REASON_MAX_CHARS;

  // ── Computed ──────────────────────────────────────────────────────────
  protected readonly requiresReason = computed(() =>
    REASON_REQUIRED_STATUSES.includes(this.selectedStatus() as typeof AIRCRAFT_STATUS[keyof typeof AIRCRAFT_STATUS])
  );

  protected readonly reasonChars = computed(() => this.reason().length);

  protected readonly isValid = computed(() => {
    const s = this.selectedStatus();
    if (!s || s === this.currentStatus()) return false;
    if (this.requiresReason() && this.reason().trim().length < 5) return false;
    return true;
  });

  protected readonly selectedOption = computed(() =>
    STATUS_OPTIONS.find(o => o.value === this.selectedStatus()) ?? null
  );

  ngOnInit(): void {
    this.selectedStatus.set(this.currentStatus());
  }

  protected onStatusChange(value: string): void {
    this.selectedStatus.set(value);
    if (!this.requiresReason()) this.reason.set('');
  }

  protected onSubmit(): void {
    if (!this.isValid() || this.isProcessing()) return;
    this.statusChanged.emit({
      status: this.selectedStatus(),
      reason: this.reason().trim() || undefined,
    });
  }
}