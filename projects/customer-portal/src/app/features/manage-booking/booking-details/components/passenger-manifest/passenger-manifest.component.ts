// passenger-manifest.component.ts
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IBookingPassengerDetailDto } from '@shared-core';

@Component({
  selector: 'app-passenger-manifest',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './passenger-manifest.component.html',
  styleUrls: ['./passenger-manifest.component.scss']
})
export class PassengerManifestComponent {
  @Input({ required: true }) passengers!: IBookingPassengerDetailDto[];

  maskPassport(value?: string | null): string {
    if (!value) return '—';
    const v = value.trim();
    if (v.length <= 4) return v;
    return '••••' + v.slice(-4).toUpperCase();
  }

  formatDob(value?: string | Date | null): string {
    if (!value) return '—';
    return new Date(value).toLocaleDateString('en-SG', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  trackByPax(_: number, p: IBookingPassengerDetailDto): number { return p.passengerId; }
}