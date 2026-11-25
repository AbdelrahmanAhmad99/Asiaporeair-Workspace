
import {
  Component, Input, ChangeDetectionStrategy, signal, computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IOfferCard } from '../../store/flights.store';

@Component({
  selector: 'app-offer-carousel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule],
  templateUrl: './offer-carousel.component.html',
  styleUrl: './offer-carousel.component.scss',
})
export class OfferCarouselComponent {
  @Input() offers: IOfferCard[] = [];
}