
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth-layout-footer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule],
  templateUrl: './auth-layout-footer.component.html',
  styleUrl: './auth-layout-footer.component.scss',
})
export class AuthLayoutFooterComponent {
  readonly currentYear = new Date().getFullYear();
}