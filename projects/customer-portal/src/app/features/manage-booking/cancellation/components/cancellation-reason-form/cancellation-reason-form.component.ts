// cancellation-reason-form.component.ts
import {
  Component, Input, Output, EventEmitter,
  ChangeDetectionStrategy, OnInit, inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

const REASON_PRESETS = [
  'Change in travel plans',
  'Medical or health reasons',
  'Work or professional obligations',
  'Visa or documentation issues',
  'Personal or family emergency',
  'Flight schedule no longer suitable',
  'Other (please specify below)'
];

@Component({
  selector: 'app-cancellation-reason-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
  animations: [
    trigger('formSlideIn', [
      transition(':enter', [
        query('.form-item', [
          style({ opacity: 0, transform: 'translateY(12px)' }),
          stagger(50, [
            animate('320ms cubic-bezier(0.22,1,0.36,1)',
              style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ],
  templateUrl: './cancellation-reason-form.component.html',
  styleUrls: ['./cancellation-reason-form.component.scss']
})
export class CancellationReasonFormComponent implements OnInit {

  private readonly fb = inject(FormBuilder);

  @Input() disabled = false;
  @Output() reasonChange = new EventEmitter<string>();

  readonly presets = REASON_PRESETS;

  form!: FormGroup;

  ngOnInit(): void {
    this.form = this.fb.group({
      preset: ['', []],
      details: ['', [Validators.minLength(10), Validators.maxLength(500)]]
    });

    this.form.valueChanges.subscribe(v => {
      const combined = [v.preset, v.details].filter(Boolean).join(' — ');
      this.reasonChange.emit(combined.trim());
    });
  }

  get combinedLength(): number {
    const v = this.form.value;
    return ([v.preset, v.details].filter(Boolean).join(' — ')).trim().length;
  }

  get detailsError(): string | null {
    const c = this.form.get('details');
    if (!c?.touched || c.valid) return null;
    if (c.hasError('minlength')) return 'Please provide a bit more detail (10+ characters).';
    if (c.hasError('maxlength')) return 'Maximum 500 characters.';
    return null;
  }
}