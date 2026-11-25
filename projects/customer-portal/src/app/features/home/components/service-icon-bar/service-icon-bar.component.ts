import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IServiceIcon } from '../../store/flights.store';

@Component({
  selector: 'app-service-icon-bar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './service-icon-bar.component.html',
  styleUrl: './service-icon-bar.component.scss',
})
export class ServiceIconBarComponent {
  @Input({ required: true }) icons!: IServiceIcon[];
}