import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loyalty-join-banner',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule],
  templateUrl: './loyalty-join-banner.component.html',
  styleUrl: './loyalty-join-banner.component.scss',
})
export class LoyaltyJoinBannerComponent {
  readonly tiers = [
    { name: 'Silver', miles: '10,000', color: '#C0C0C0' },
    { name: 'Gold', miles: '50,000', color: '#B68F24' },
    { name: 'Platinum', miles: '150,000', color: '#E5E4E2' },
    { name: 'Diamond', miles: '500,000', color: '#B9F2FF' },
  ];
}