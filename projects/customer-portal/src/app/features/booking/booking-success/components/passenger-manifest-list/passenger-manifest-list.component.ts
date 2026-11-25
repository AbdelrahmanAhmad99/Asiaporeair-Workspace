// passenger-manifest-list.component.ts
import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IBookingPassengerDetailDto, IAncillarySaleDto } from '@shared-core';
import { IPassengerSeatAssignment } from '../../../store/booking.store';

// Category icon mapping
const CATEGORY_ICONS: Record<string, string> = {
  BAGGAGE: 'baggage', MEAL: 'meal', LOUNGE: 'lounge',
  WIFI: 'wifi', INSURANCE: 'insurance', OXYGEN: 'oxygen'
};

@Component({
  selector: 'app-passenger-manifest-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './passenger-manifest-list.component.html',
  styleUrls: ['./passenger-manifest-list.component.scss']
})
export class PassengerManifestListComponent {

  readonly passengers = input<IBookingPassengerDetailDto[]>([]);
  readonly ancillarySales = input<IAncillarySaleDto[]>([]);
  readonly seatAssignments = input<IPassengerSeatAssignment[]>([]);
  readonly currency = input<string>('SGD');

  getSeatForPassenger(passengerId: number): string {
    return this.seatAssignments().find(a => a.passengerId === passengerId)?.seatNumber
      ?? 'Not assigned';
  }

  getAncillariesForPassenger(passengerId: number): IAncillarySaleDto[] {
    // API may not tie ancillaries to individual passengers in simplified flow
    return this.ancillarySales();
  }

  getCategoryIconKey(productName: string): string {
    const name = productName.toUpperCase();
    if (name.includes('BAGGAGE') || name.includes('BAG')) return 'baggage';
    if (name.includes('MEAL') || name.includes('FOOD') || name.includes('DINE')) return 'meal';
    if (name.includes('OXYGEN') || name.includes('MEDICAL')) return 'oxygen';
    if (name.includes('WIFI') || name.includes('INTERNET')) return 'wifi';
    if (name.includes('LOUNGE')) return 'lounge';
    if (name.includes('INSUR')) return 'insurance';
    return 'default';
  }

  formatPrice(amount: number): string {
    return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  trackByPax(_: number, p: IBookingPassengerDetailDto): number { return p.passengerId; }
  trackBySale(_: number, s: IAncillarySaleDto): number { return s.saleId; }
}