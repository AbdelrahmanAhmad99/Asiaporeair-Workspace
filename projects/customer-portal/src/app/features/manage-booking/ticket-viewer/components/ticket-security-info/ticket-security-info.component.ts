// ticket-security-info.component.ts
import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { ITicketDetailDto } from '@shared-core';

interface ISecuritySection {
  id: string;
  title: string;
  icon: string; // SVG path d attribute
  items: string[];
}

const SECURITY_SECTIONS: ISecuritySection[] = [
  {
    id: 'baggage', title: 'Baggage Allowance',
    icon: 'M16 20H8l-1-9h10l-1 9zM6 8V5a3 3 0 0 1 6 0v3M2 8h20v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8z',
    items: [
      'Economy: 20 kg checked + 7 kg cabin. Premium Economy: 25 kg + 10 kg. Business/Suite: 40 kg + 15 kg.',
      'One personal item (max 40×30×20 cm) permitted in addition to cabin baggage.',
      'Excess baggage charges apply. Pre-purchase is required at asiaporeair.com.',
      'Oversize items (sports equipment, musical instruments) must be declared at check-in.'
    ]
  },
  {
    id: 'hazmat', title: 'Dangerous Goods & Prohibited Items',
    icon: 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01',
    items: [
      'Explosives, flammable liquids, gases, oxidisers, and radioactive materials are strictly prohibited.',
      'Lithium batteries (>100 Wh or >2 g Li) must be carried in cabin only; not permitted in checked baggage.',
      'Firearms and ammunition may only be transported with prior written approval from Asiaporeair Security.',
      'Electronic cigarettes and vaping devices must be carried in cabin baggage with no charging permitted.',
      'Full IATA Dangerous Goods Regulations apply. Declaration of undisclosed hazmat is a criminal offence.'
    ]
  },
  {
    id: 'conditions', title: 'Conditions of Contract',
    icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8',
    items: [
      'This ticket is valid only for the flight(s) and date(s) shown. Stopovers require separate authority.',
      'Asiaporeair\'s liability is governed by the Montreal Convention 1999, unless otherwise stated.',
      'In case of denied boarding, flight delay (≥2h), or cancellation, compensation rights apply per applicable regulations.',
      'Name changes are not permitted. Tickets are non-transferable. Date changes are subject to fare rules and fees.',
      'Passengers must present valid government-issued photo ID or passport matching the name on this ticket.',
      'Check-in closes 45 minutes before scheduled departure. Asiaporeair is not liable for missed connections due to late check-in.'
    ]
  }
];

@Component({
  selector: 'app-ticket-security-info',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  animations: [
    trigger('expand', [
      transition(':enter', [
        style({ height: 0, opacity: 0, overflow: 'hidden' }),
        animate('260ms cubic-bezier(0.4,0,0.2,1)', style({ height: '*', opacity: 1 }))
      ]),
      transition(':leave', [
        style({ overflow: 'hidden' }),
        animate('180ms ease-in', style({ height: 0, opacity: 0 }))
      ])
    ])
  ],
  templateUrl: './ticket-security-info.component.html',
  styleUrls: ['./ticket-security-info.component.scss']
})
export class TicketSecurityInfoComponent {
  @Input() isExpanded = false;
  @Input() ticket!: ITicketDetailDto;
  @Output() toggleExpand = new EventEmitter<void>();

  readonly sections = SECURITY_SECTIONS;
  openSectionId: string | null = null;

  toggleSection(id: string): void {
    this.openSectionId = this.openSectionId === id ? null : id;
  }
}