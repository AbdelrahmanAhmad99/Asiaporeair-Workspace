import {
  Component, Input, Output, EventEmitter, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IAdvisoryAlert } from '../../store/flights.store';

@Component({
  selector: 'app-advisory-alert-bar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule],
  templateUrl: './advisory-alert-bar.component.html',
  styleUrl: './advisory-alert-bar.component.scss',
})
export class AdvisoryAlertBarComponent {
  @Input({ required: true }) alerts!: IAdvisoryAlert[];
  @Output() alertDismissed = new EventEmitter<string>();
}