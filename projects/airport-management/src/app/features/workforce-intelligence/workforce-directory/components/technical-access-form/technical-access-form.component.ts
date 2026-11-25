

import {
  ChangeDetectionStrategy,
  Component,
  OnChanges,
  SimpleChanges,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  AnyUserProfileDto,
  PilotProfileDto, AttendantProfileDto,
  AdminProfileDto, SupervisorProfileDto,
} from '@shared-core';
import { IAirportDto } from '@shared-core';
import { IAircraftTypeDto } from '@shared-core';
import { TechnicalRole, IProfileUpdatePayload } from '../../store/workforce-wdo.store';

@Component({
  selector: 'aoms-technical-access-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './technical-access-form.component.html',
  styleUrl: './technical-access-form.component.scss',
})
export class TechnicalAccessFormComponent {
  // ── Inputs ─────────────────────────────────────────────────────────
  readonly profile = input.required<AnyUserProfileDto>();
  readonly role = input.required<TechnicalRole>();
  readonly airports = input<IAirportDto[]>([]);
  readonly aircraftTypes = input<IAircraftTypeDto[]>([]);
  readonly isSubmitting = input<boolean>(false);
  readonly isLoadingDeps = input<boolean>(false);

  // ── Outputs ─────────────────────────────────────────────────────────
  readonly updateSubmitted = output<IProfileUpdatePayload>();
  readonly cancelled = output<void>();

  // ── Role helpers ─────────────────────────────────────────────────────
  protected readonly isPilot = computed(() => this.role() === 'pilot');
  protected readonly isAttendant = computed(() => this.role() === 'attendant');
  protected readonly isAdmin = computed(() => this.role() === 'admin');
  protected readonly isSupervisor = computed(() => this.role() === 'supervisor');
  protected readonly needsAirport = computed(() => this.isPilot() || this.isAttendant());

  // ── Editable form fields ────────────────────────────────────────────
  protected firstName = signal('');
  protected lastName = signal('');
  protected phoneNumber = signal('');
  protected dateOfBirth = signal('');
  protected address = signal('');
  protected dateOfHire = signal('');
  protected salary = signal('');
  protected profilePicture = signal<File | null>(null);
  // Admin
  protected department = signal('');
  // Supervisor
  protected managedArea = signal('');
  // Pilot & Attendant
  protected crewBaseAirportId = signal('');
  protected airportSearch = signal('');
  protected showAirportDrop = signal(false);
  // Pilot only
  protected licenseNumber = signal('');
  protected totalFlightHours = signal('');
  protected lastSimCheckDate = signal('');

  // Validation
  protected touched = signal(false);

  // ── Airport lookup helpers ─────────────────────────────────────────
  protected readonly filteredAirports = computed(() => {
    const q = this.airportSearch().toLowerCase().trim();
    const list = this.airports();
    if (!q) return list.slice(0, 40);
    return list.filter(a =>
      a.iataCode.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q) ||
      a.city.toLowerCase().includes(q)
    ).slice(0, 20);
  });

  protected readonly selectedAirportLabel = computed(() => {
    const code = this.crewBaseAirportId();
    if (!code) return '';
    const ap = this.airports().find(a => a.iataCode === code);
    return ap ? `${ap.iataCode} – ${ap.name}` : code;
  });

  // ── Validation ────────────────────────────────────────────────────────
  protected readonly isValid = computed(() => {
    if (!this.firstName() || !this.lastName()) return false;
    if (this.needsAirport() && !this.crewBaseAirportId()) return false;
    if (this.isPilot() && !this.licenseNumber()) return false;
    return true;
  });

  private toDateInput(value: unknown): string {
    if (!value) return '';
    const raw = String(value).trim();
    if (!raw) return '';
    const isoDateOnly = raw.match(/^\d{4}-\d{2}-\d{2}/)?.[0];
    if (isoDateOnly) return isoDateOnly;
    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) return '';
    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const day = String(parsed.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  constructor() {
    // Sync form fields when profile changes
    effect(() => {
      const p = this.profile();
      if (!p) return;
      this.firstName.set(p.firstName ?? '');
      this.lastName.set(p.lastName ?? '');
      this.phoneNumber.set(p.phoneNumber ?? '');
      this.dateOfBirth.set(
        this.toDateInput(
          (p as any).dateOfBirth ?? (p as any).birthDate ?? (p as any).dob
        )
      );
      this.address.set(p.address ?? '');

      const emp = p as AdminProfileDto;
      this.dateOfHire.set(
        this.toDateInput(
          (emp as any).dateOfHire ?? (emp as any).hireDate ?? (emp as any).hiredDate
        )
      );
      this.salary.set(emp.salary?.toString() ?? '');

      if (this.isAdmin()) this.department.set((p as AdminProfileDto).department ?? '');
      if (this.isSupervisor()) this.managedArea.set((p as any).managedArea ?? '');

      if (this.isPilot()) {
        const pilot = p as PilotProfileDto;
        this.crewBaseAirportId.set(pilot.crewBaseAirportId ?? '');
        this.airportSearch.set(pilot.crewBaseAirportId ?? '');
        this.licenseNumber.set(pilot.licenseNumber ?? '');
        this.totalFlightHours.set(pilot.totalFlightHours?.toString() ?? '');
        this.lastSimCheckDate.set(this.toDateInput(pilot.lastSimCheckDate));
      }

      if (this.isAttendant()) {
        const att = p as AttendantProfileDto;
        this.crewBaseAirportId.set(att.crewBaseAirportId ?? '');
        this.airportSearch.set(att.crewBaseAirportId ?? '');
      }
    });
  }

  // ── Airport select ────────────────────────────────────────────────
  protected onAirportFocus(): void { this.airportSearch.set(''); this.showAirportDrop.set(true); }
  protected onAirportBlur(): void { setTimeout(() => this.showAirportDrop.set(false), 200); }
  protected onSelectAirport(iata: string): void {
    this.crewBaseAirportId.set(iata);
    const ap = this.airports().find(a => a.iataCode === iata);
    this.airportSearch.set(ap ? `${ap.iataCode} – ${ap.name}` : iata);
    this.showAirportDrop.set(false);
  }

  // ── File ───────────────────────────────────────────────────────────
  protected onFileChange(e: Event): void {
    const file = (e.target as HTMLInputElement).files?.[0] ?? null;
    this.profilePicture.set(file);
  }

  // ── Submit ────────────────────────────────────────────────────────
  protected onSubmit(): void {
    this.touched.set(true);
    if (!this.isValid() || this.isSubmitting()) return;

    this.updateSubmitted.emit({
      firstName: this.firstName().trim(),
      lastName: this.lastName().trim(),
      phoneNumber: this.phoneNumber().trim() || undefined,
      dateOfBirth: this.dateOfBirth() || undefined,
      address: this.address().trim() || undefined,
      profilePicture: this.profilePicture() ?? undefined,
      dateOfHire: this.dateOfHire() || undefined,
      salary: this.salary() ? parseFloat(this.salary()) : undefined,
      department: this.isAdmin() ? this.department().trim() || undefined : undefined,
      managedArea: this.isSupervisor() ? this.managedArea().trim() || undefined : undefined,
      crewBaseAirport: this.needsAirport() ? this.crewBaseAirportId() || undefined : undefined,
      licenseNumber: this.isPilot() ? this.licenseNumber().trim() || undefined : undefined,
      totalFlightHours: this.isPilot() && this.totalFlightHours()
        ? parseFloat(this.totalFlightHours()) : undefined,
      lastSimCheckDate: this.isPilot() ? this.lastSimCheckDate() || undefined : undefined,
    });
  }
}