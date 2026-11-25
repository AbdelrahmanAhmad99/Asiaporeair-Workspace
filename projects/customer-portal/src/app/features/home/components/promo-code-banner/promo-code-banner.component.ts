
import {
  Component, ChangeDetectionStrategy, signal, inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';

type ApplyState = 'idle' | 'success' | 'error';

@Component({
  selector: 'app-promo-code-banner',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './promo-code-banner.component.html',
  styleUrl: './promo-code-banner.component.scss',

})
export class PromoCodeBannerComponent {

  private readonly fb = inject(FormBuilder);

  readonly form: FormGroup = this.fb.group({
    code: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(20)]],
  });

  readonly isLoading = signal(false);
  readonly appliedState = signal<ApplyState>('idle');

  onApply(): void {
    if (this.form.invalid || this.isLoading()) return;

    this.isLoading.set(true);
    this.appliedState.set('idle');

    // Simulate promo code validation — replace with real PromoCodeService call
    const code = (this.form.value.code as string).toUpperCase().trim();

    setTimeout(() => {
      this.isLoading.set(false);
      // VOYAGE25 is the demo valid code — remove in production
      this.appliedState.set(code === 'VOYAGE25' ? 'success' : 'error');
    }, 900);
  }
}