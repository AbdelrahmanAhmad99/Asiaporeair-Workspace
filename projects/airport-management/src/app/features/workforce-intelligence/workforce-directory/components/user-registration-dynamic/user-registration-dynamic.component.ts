
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

import { OnboardingRole, IOnboardingPayload } from '../../store/workforce-wdo.store';
import { IAirportDto } from '@shared-core';
import { IAircraftTypeDto } from '@shared-core';

export interface IPasswordStrength {
  score: 0 | 1 | 2 | 3 | 4; // 0=empty, 1=weak, 2=fair, 3=good, 4=strong
  label: string;
  pct: number;
}

function assessPassword(pw: string): IPasswordStrength {
  if (!pw) return { score: 0, label: '', pct: 0 };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  return { score: score as 0 | 1 | 2 | 3 | 4, label: labels[score], pct: score * 25 };
}

@Component({
  selector: 'aoms-user-registration-dynamic',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './user-registration-dynamic.component.html',
  styleUrl: './user-registration-dynamic.component.scss',
})
export class UserRegistrationDynamicComponent {
  // ── Inputs ─────────────────────────────────────────────────────────
  readonly role = input.required<OnboardingRole>();
  readonly airports = input<IAirportDto[]>([]);
  readonly aircraftTypes = input<IAircraftTypeDto[]>([]);
  readonly isSubmitting = input<boolean>(false);
  readonly isLoadingSupport = input<boolean>(false);

  // ── Outputs ─────────────────────────────────────────────────────────
  readonly formSubmitted = output<IOnboardingPayload>();
  readonly backClicked = output<void>();

  // ── Role helpers ─────────────────────────────────────────────────────
  protected readonly isSuperAdmin = computed(() => this.role() === 'SuperAdmin');
  protected readonly isAdmin = computed(() => this.role() === 'Admin');
  protected readonly isSupervisor = computed(() => this.role() === 'Supervisor');
  protected readonly isPilot = computed(() => this.role() === 'Pilot');
  protected readonly isAttendant = computed(() => this.role() === 'Attendant');
  protected readonly needsAirport = computed(() => this.isPilot() || this.isAttendant());

  // ── Form Fields ──────────────────────────────────────────────────────
  protected firstName = signal('');
  protected lastName = signal('');
  protected email = signal('');
  protected phoneNumber = signal('');
  protected dateOfHire = signal('');
  protected salary = signal('');
  protected dateOfBirth = signal('');
  protected address = signal('');
  protected profilePicture = signal<File | null>(null);
  // SuperAdmin
  protected password = signal('');
  protected confirmPassword = signal('');
  protected showPassword = signal(false);
  // Admin
  protected department = signal('');
  // Pilot & Attendant
  protected crewBaseAirport = signal('');
  protected airportSearch = signal('');
  protected showAirportDropdown = signal(false);
  // Pilot only
  protected licenseNumber = signal('');
  protected totalFlightHours = signal('');
  protected aircraftTypeId = signal('');
  protected lastSimCheckDate = signal('');

  // ── Validation ────────────────────────────────────────────────────────
  protected touched = signal(false);

  protected readonly passwordStrength = computed<IPasswordStrength>(() =>
    assessPassword(this.password())
  );

  protected readonly filteredAirports = computed(() => {
    const q = this.airportSearch().toLowerCase().trim();
    if (!q) return this.airports().slice(0, 40); // show first 40 by default
    return this.airports().filter(a =>
      a.iataCode.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q) ||
      a.city.toLowerCase().includes(q)
    ).slice(0, 20);
  });

  protected readonly selectedAirportDisplay = computed(() => {
    if (!this.crewBaseAirport()) return '';
    const ap = this.airports().find(a => a.iataCode === this.crewBaseAirport());
    return ap ? `${ap.iataCode} – ${ap.name}` : this.crewBaseAirport();
  });

  protected readonly emailError = computed(() => {
    if (!this.touched()) return null;
    const e = this.email();
    if (!e) return 'Email address is required.';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) return 'Enter a valid email address.';
    return null;
  });

  protected readonly passwordError = computed(() => {
    if (!this.touched() || !this.isSuperAdmin()) return null;
    if (!this.password()) return 'Password is required.';
    if (this.password().length < 8) return 'Password must be at least 8 characters.';
    if (this.password() !== this.confirmPassword()) return 'Passwords do not match.';
    return null;
  });

  protected readonly pilotErrors = computed(() => {
    if (!this.touched() || !this.isPilot()) return null;
    if (!this.licenseNumber()) return 'License number is required for pilots.';
    if (!this.aircraftTypeId()) return 'Aircraft type certification is required.';
    return null;
  });

  protected readonly crewBaseError = computed(() => {
    if (!this.touched() || !this.needsAirport()) return null;
    if (!this.crewBaseAirport()) return 'Crew base airport is required for flight crew.';
    return null;
  });

  protected readonly isFormValid = computed(() => {
    if (!this.firstName() || !this.lastName()) return false;
    if (!this.email() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(this.email())) return false;
    if (!this.phoneNumber()) return false;
    if (this.isSuperAdmin() && (!this.password() || this.password() !== this.confirmPassword() || this.password().length < 8)) return false;
    if (this.needsAirport() && !this.crewBaseAirport()) return false;
    if (this.isPilot() && (!this.licenseNumber() || !this.aircraftTypeId())) return false;
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

  protected onDateOfBirthChange(value: unknown): void {
    this.dateOfBirth.set(this.toDateInput(value));
  }

  protected onDateOfHireChange(value: unknown): void {
    this.dateOfHire.set(this.toDateInput(value));
  }

  protected onLastSimCheckDateChange(value: unknown): void {
    this.lastSimCheckDate.set(this.toDateInput(value));
  }

  // ── File picker ───────────────────────────────────────────────────────
  protected onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.profilePicture.set(file);
  }

  // ── Airport select ────────────────────────────────────────────────────
  protected onSelectAirport(iata: string): void {
    this.crewBaseAirport.set(iata);
    const ap = this.airports().find(a => a.iataCode === iata);
    this.airportSearch.set(ap ? `${ap.iataCode} – ${ap.name}` : iata);
    this.showAirportDropdown.set(false);
  }

  protected onAirportInputFocus(): void {
    this.airportSearch.set('');
    this.showAirportDropdown.set(true);
  }

  protected onAirportInputBlur(): void {
    // small delay to allow click on dropdown item
    setTimeout(() => this.showAirportDropdown.set(false), 200);
  }

  // ── Submit ────────────────────────────────────────────────────────────
  protected onSubmit(): void {
    this.touched.set(true);
    if (!this.isFormValid() || this.isSubmitting()) return;

    const normalizedDateOfBirth = this.toDateInput(this.dateOfBirth());
    const normalizedDateOfHire = this.toDateInput(this.dateOfHire());
    const normalizedLastSimCheckDate = this.toDateInput(this.lastSimCheckDate());

    this.formSubmitted.emit({
      role: this.role(),
      firstName: this.firstName().trim(),
      lastName: this.lastName().trim(),
      email: this.email().trim(),
      phoneNumber: this.phoneNumber().trim(),
      dateOfHire: normalizedDateOfHire || undefined,
      salary: this.salary() ? parseFloat(this.salary()) : undefined,
      dateOfBirth: normalizedDateOfBirth || undefined,
      address: this.address().trim() || undefined,
      profilePicture: this.profilePicture() ?? undefined,
      // SuperAdmin
      password: this.isSuperAdmin() ? this.password() : undefined,
      confirmPassword: this.isSuperAdmin() ? this.confirmPassword() : undefined,
      // Admin
      department: this.isAdmin() ? this.department().trim() : undefined,
      // Pilot & Attendant
      crewBaseAirport: this.needsAirport() ? this.crewBaseAirport() : undefined,
      // Pilot
      licenseNumber: this.isPilot() ? this.licenseNumber().trim() : undefined,
      totalFlightHours: this.isPilot() && this.totalFlightHours() ? parseFloat(this.totalFlightHours()) : undefined,
      aircraftTypeId: this.isPilot() ? parseInt(this.aircraftTypeId(), 10) : undefined,
      lastSimCheckDate: this.isPilot() ? normalizedLastSimCheckDate || undefined : undefined,
    });
  }
}