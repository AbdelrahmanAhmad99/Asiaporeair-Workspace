// action-hub-footer.component.ts
import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-action-hub-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './action-hub-footer.component.html',
  styleUrls: ['./action-hub-footer.component.scss']
})
export class ActionHubFooterComponent {

  readonly isPrintMode = input<boolean>(false);

  readonly manageJourney = output<void>();
  readonly viewProfile = output<void>();
  readonly returnHome = output<void>();
  readonly beginNewJourney = output<void>();
  readonly printReceipt = output<void>();
}