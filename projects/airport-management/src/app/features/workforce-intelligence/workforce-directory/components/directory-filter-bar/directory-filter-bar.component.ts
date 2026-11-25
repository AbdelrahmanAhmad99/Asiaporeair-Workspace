
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IWdoFilters } from '../../store/workforce-wdo.store';
import { EmployeeStatus } from '../../store/employee.model';

export const ROLE_OPTIONS = [
  { value: '', label: 'All Roles' },
  { value: 'SuperAdmin', label: 'Super Admin' },
  { value: 'Admin', label: 'Administrator' },
  { value: 'Supervisor', label: 'Supervisor' },
  { value: 'Pilot', label: 'Pilot' },
  { value: 'Attendant', label: 'Cabin Crew' },
];

export const STATUS_OPTIONS: { value: EmployeeStatus | ''; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
  { value: 'OnLeave', label: 'On Leave' },
];

@Component({
  selector: 'aoms-directory-filter-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './directory-filter-bar.component.html',
  styleUrl: './directory-filter-bar.component.scss',
})
export class DirectoryFilterBarComponent implements OnInit, OnDestroy {
  // ── Inputs ─────────────────────────────────────────────────────────
  readonly currentFilters = input<IWdoFilters>({ role: '', search: '', status: '' });
  readonly loading = input<boolean>(false);

  // ── Outputs ─────────────────────────────────────────────────────────
  readonly filtersChanged = output<Partial<IWdoFilters>>();
  readonly resetTriggered = output<void>();
  readonly onboardClicked = output<void>();

  protected readonly roleOptions = ROLE_OPTIONS;
  protected readonly statusOptions = STATUS_OPTIONS;

  // Local form state
  protected searchValue = '';
  protected roleValue = '';
  protected statusValue: EmployeeStatus | '' = '';

  private _searchTimer?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    const f = this.currentFilters();
    this.searchValue = f.search;
    this.roleValue = f.role;
    this.statusValue = f.status;
  }

  ngOnDestroy(): void {
    clearTimeout(this._searchTimer);
  }

  protected onSearchInput(val: string): void {
    this.searchValue = val;
    clearTimeout(this._searchTimer);
    this._searchTimer = setTimeout(() => {
      this.filtersChanged.emit({ search: val });
    }, 300);
  }

  protected onRoleChange(val: string): void {
    this.roleValue = val;
    this.filtersChanged.emit({ role: val });
  }

  protected onStatusChange(val: EmployeeStatus | ''): void {
    this.statusValue = val;
    this.filtersChanged.emit({ status: val });
  }

  protected onClear(): void {
    this.searchValue = '';
    this.roleValue = '';
    this.statusValue = '';
    this.resetTriggered.emit();
  }

  protected get isFiltered(): boolean {
    return !!(this.searchValue || this.roleValue || this.statusValue);
  }
}