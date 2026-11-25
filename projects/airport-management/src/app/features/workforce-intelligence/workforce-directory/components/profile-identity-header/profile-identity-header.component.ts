

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IEmployeeSummaryDto } from '../../store/employee.model';

interface IRoleMeta {
  label: string;
  iconPath: string;
  cssVar: string;  // CSS custom property for the accent tint
}

const ROLE_META: Record<string, IRoleMeta> = {
  pilot: {
    label: 'Pilot',
    iconPath: 'M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12zm0 0h7.5',
    cssVar: '--role-cobalt',
  },
  attendant: {
    label: 'Cabin Crew',
    iconPath: 'M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0zM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632z',
    cssVar: '--role-emerald',
  },
  admin: {
    label: 'Administrator',
    iconPath: 'M9 12.75 11.25 15 15 9.75m-10.5.75a8.25 8.25 0 1 1 16.5 0 8.25 8.25 0 0 1-16.5 0z',
    cssVar: '--role-slate',
  },
  supervisor: {
    label: 'Supervisor',
    iconPath: 'M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
    cssVar: '--role-violet',
  },
  superadmin: {
    label: 'Super Admin',
    iconPath: 'M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0',
    cssVar: '--role-gold',
  },
};

@Component({
  selector: 'aoms-profile-identity-header',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './profile-identity-header.component.html',
  styleUrl: './profile-identity-header.component.scss',
})
export class ProfileIdentityHeaderComponent {
  readonly employee = input.required<IEmployeeSummaryDto>();

  protected readonly roleMeta = computed<IRoleMeta>(() => {
    const key = this.employee().role?.toLowerCase().replace(/\s/g, '') ?? '';
    return ROLE_META[key] ?? ROLE_META['admin'];
  });

  protected readonly initials = computed(() => {
    const e = this.employee();
    return `${e.firstName?.[0] ?? ''}${e.lastName?.[0] ?? ''}`.toUpperCase();
  });

  protected readonly fullName = computed(() => {
    const e = this.employee();
    return `${e.firstName} ${e.lastName}`;
  });

  protected readonly hireDateLabel = computed(() => {
    const d = this.employee().hireDate;
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-SG', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  });
}