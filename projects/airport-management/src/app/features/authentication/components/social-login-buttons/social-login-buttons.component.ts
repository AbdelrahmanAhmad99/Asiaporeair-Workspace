
import {
  Component, ChangeDetectionStrategy, Output, EventEmitter
} from '@angular/core';
import { CommonModule } from '@angular/common';

export type SocialProvider = 'google' | 'facebook' | 'apple';

@Component({
  selector: 'app-social-login-buttons',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './social-login-buttons.component.html',
  styleUrls: ['./social-login-buttons.component.scss'],
})
export class SocialLoginButtonsComponent {

  @Output() providerSelect = new EventEmitter<SocialProvider>();

  readonly providers: { id: SocialProvider; label: string }[] = [
    { id: 'google', label: 'Google' },
    { id: 'facebook', label: 'Facebook' },
    { id: 'apple', label: 'Apple' },
  ];

  onSelect(provider: SocialProvider): void {
    this.providerSelect.emit(provider);
    // OAuth redirect logic would be wired here via an OAuthService
  }
}