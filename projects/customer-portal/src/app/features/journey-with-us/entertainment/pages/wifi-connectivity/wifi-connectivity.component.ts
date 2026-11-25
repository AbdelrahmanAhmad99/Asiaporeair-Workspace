// ============================================================================
// wifi-connectivity.component.ts
// Asiaporeair | Smart Page — Wi-Fi Connectivity
// ============================================================================

import {
  Component, ChangeDetectionStrategy, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ConnectivitySpeedBadgeComponent } from '../../components/connectivity-speed-badge/connectivity-speed-badge.component';
import { CONNECTIVITY_PLANS, IConnectivityPlan } from '../../../models/journey-with-us.models';

@Component({
  selector: 'app-wifi-connectivity',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, ConnectivitySpeedBadgeComponent],
  templateUrl: './wifi-connectivity.component.html',
  styleUrls: ['./wifi-connectivity.component.scss']
})
export class WifiConnectivityComponent {

  readonly plans = signal<IConnectivityPlan[]>(CONNECTIVITY_PLANS);

  readonly connectSteps = [
    {
      num: '01',
      title: 'Enable Wi-Fi',
      desc: 'Enable Wi-Fi on your device and select the Asiaporeair inflight network from your settings.'
    },
    {
      num: '02',
      title: 'Open the Portal',
      desc: 'Open your browser and you\'ll be automatically directed to the SkyWorld connectivity portal.'
    },
    {
      num: '03',
      title: 'Choose Your Plan',
      desc: 'Select the plan that suits your needs. Suites and First Class passengers connect automatically.'
    },
    {
      num: '04',
      title: 'Browse Freely',
      desc: 'Your device is now connected. Enjoy seamless, high-speed Wi-Fi for the duration of your flight.'
    }
  ];
}