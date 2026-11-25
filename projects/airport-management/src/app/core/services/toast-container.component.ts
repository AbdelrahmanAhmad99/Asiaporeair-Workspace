// =============================================================================
// toast-container.component.ts
// Asiaporeair | Core / Services — Toast Notification Container
//
// Place once at the root level inside AppComponent's template:
//   <app-toast-container />
// =============================================================================

import {
  Component, inject, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule }  from '@angular/common';
import { ToastService, ToastMessage } from './toast.service';

@Component({
  selector:         'app-toast-container',
  standalone:       true,
  changeDetection:  ChangeDetectionStrategy.OnPush,
  imports:          [CommonModule],
  template: `
    <div class="toast-container" aria-live="polite" aria-atomic="false">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="toast toast--{{ toast.type }}"
          role="alert"
        >
          @if (toast.title) {
            <strong class="toast__title">{{ toast.title }}</strong>
          }
          <span class="toast__message">{{ toast.message }}</span>
          <button
            class="toast__close"
            type="button"
            aria-label="Dismiss notification"
            (click)="toastService.dismiss(toast.id)"
          >✕</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position:       fixed;
      top:            24px;
      right:          24px;
      z-index:        9999;
      display:        flex;
      flex-direction: column;
      gap:            10px;
      max-width:      380px;
      width:          100%;
      pointer-events: none;
    }

    .toast {
      display:          flex;
      align-items:      flex-start;
      gap:              10px;
      padding:          14px 16px;
      border-radius:    8px;
      font-family:      'Montserrat', 'Inter', sans-serif;
      font-size:        13px;
      line-height:      1.5;
      pointer-events:   all;
      box-shadow:       0 8px 24px rgba(5, 25, 55, 0.15);
      animation:        slideIn 220ms ease forwards;

      &--success { background: #1A7F5A; color: #fff; }
      &--error   { background: #B91C1C; color: #fff; }
      &--info    { background: #1D4ED8; color: #fff; }
      &--warn    { background: #B45309; color: #fff; }
    }

    .toast__title   { font-weight: 700; white-space: nowrap; }
    .toast__message { flex: 1; }

    .toast__close {
      background:  none;
      border:      none;
      color:       inherit;
      cursor:      pointer;
      font-size:   14px;
      line-height: 1;
      opacity:     0.7;
      padding:     0;
      flex-shrink: 0;
      &:hover { opacity: 1; }
    }

    @keyframes slideIn {
      from { opacity: 0; transform: translateX(20px); }
      to   { opacity: 1; transform: translateX(0); }
    }

    @media (prefers-reduced-motion: reduce) {
      .toast { animation: none; }
    }
  `],
})
export class ToastContainerComponent {
  readonly toastService = inject(ToastService);
}