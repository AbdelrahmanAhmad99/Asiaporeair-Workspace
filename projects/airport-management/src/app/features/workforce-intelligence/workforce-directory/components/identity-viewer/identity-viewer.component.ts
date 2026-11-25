

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnyUserProfileDto, PilotProfileDto } from '@shared-core';
import { TechnicalRole } from '../../store/workforce-wdo.store';

@Component({
  selector: 'aoms-identity-viewer',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './identity-viewer.component.html',
  styleUrl: './identity-viewer.component.scss',
})
export class IdentityViewerComponent {
  readonly profile = input.required<AnyUserProfileDto>();
  readonly role = input.required<TechnicalRole>();

  protected readonly roleMeta = computed(() => {
    const r = this.role();
    const map: Record<TechnicalRole, { label: string; cssClass: string }> = {
      superadmin: { label: 'Super Admin', cssClass: 'role--sa' },
      admin: { label: 'Administrator', cssClass: 'role--admin' },
      supervisor: { label: 'Supervisor', cssClass: 'role--sup' },
      pilot: { label: 'Pilot', cssClass: 'role--pilot' },
      attendant: { label: 'Cabin Crew', cssClass: 'role--crew' },
    };
    return map[r] ?? map['admin'];
  });

  protected readonly isPilot = computed(() => this.role() === 'pilot');

  protected readonly pilotProfile = computed(() =>
    this.isPilot() ? (this.profile() as PilotProfileDto) : null
  );

  protected formatDate(d: string | null | undefined): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-SG', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  protected truncateId(id: string | null | undefined): string {
    if (!id) return '—';
    return id.length > 16 ? `${id.slice(0, 8)}…${id.slice(-6)}` : id;
  }
}