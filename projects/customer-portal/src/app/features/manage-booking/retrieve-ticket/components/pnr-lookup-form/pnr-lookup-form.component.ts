// ============================================================================
// pnr-lookup-form.component.ts
// Asiaporeair | Ticket Lookup Form — Dumb/UI Component
// ============================================================================

import {
  Component, OnInit, Output, EventEmitter, Input,
  ChangeDetectionStrategy
} from '@angular/core';
import {
  FormBuilder, FormGroup, Validators,
  ReactiveFormsModule, AbstractControl
} from '@angular/forms';
import { inject } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';

import { ITicketLookupFormValue } from '../../pages/retrieve-ticket/retrieve-ticket.component';

/** Custom validator: alphanumeric only, 6–13 characters. */
function ticketCodeValidator(control: AbstractControl): { [key: string]: boolean } | null {
  const val: string = control.value ?? '';
  if (!val) return null; // let `required` handle empty
  return /^[A-Za-z0-9]{6,13}$/.test(val) ? null : { ticketCodePattern: true };
}

@Component({
  selector: 'app-pnr-lookup-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  animations: [
    trigger('errorSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-6px)' }),
        animate('220ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('180ms ease-in', style({ opacity: 0, transform: 'translateY(-4px)' }))
      ])
    ])
  ],
  templateUrl: './pnr-lookup-form.component.html',
  styleUrls: ['./pnr-lookup-form.component.scss']
})
export class PnrLookupFormComponent implements OnInit {

  // ── Inputs ──────────────────────────────────────────────────────────────────

  /** Disables the form + button while the parent is retrieving the ticket. */
  @Input() isLoading = false;

  /** Surfaces a backend or validation error from the parent smart page. */
  @Input() serverError: string | null = null;

  // ── Outputs ─────────────────────────────────────────────────────────────────

  /** Emitted once the form is valid and the user submits. */
  @Output() formSubmit = new EventEmitter<ITicketLookupFormValue>();

  // ── DI ──────────────────────────────────────────────────────────────────────
  private readonly fb = inject(FormBuilder);

  // ── Form Model ───────────────────────────────────────────────────────────────
  form!: FormGroup;

  get ticketCodeCtrl() { return this.form.get('ticketCode')!; }
  get lastNameCtrl()   { return this.form.get('lastName')!; }

  // ── Helpers for floating-label state ────────────────────────────────────────
  isTicketCodeFocused = false;
  isLastNameFocused   = false;

  // ── Lifecycle ────────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.form = this.fb.group({
      ticketCode: ['', [Validators.required, ticketCodeValidator]],
      lastName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(60)
      ]]
    });
  }

  // ── Actions ─────────────────────────────────────────────────────────────────

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.isLoading) return;

    this.formSubmit.emit({
      ticketCode: this.ticketCodeCtrl.value,
      lastName: this.lastNameCtrl.value
    });
  }

  // ── Template Helpers ─────────────────────────────────────────────────────────

  getTicketCodeError(): string {
    const c = this.ticketCodeCtrl;
    if (c.hasError('required'))          return 'Ticket reference is required.';
    if (c.hasError('ticketCodePattern')) return 'Ticket reference must be 6–13 alphanumeric characters.';
    return '';
  }

  getLastNameError(): string {
    const c = this.lastNameCtrl;
    if (c.hasError('required'))   return 'Last name is required.';
    if (c.hasError('minlength'))  return 'Last name must be at least 2 characters.';
    if (c.hasError('maxlength'))  return 'Last name must not exceed 60 characters.';
    return '';
  }

  /** True when a control is invalid and has been touched/dirty. */
  isInvalid(ctrl: AbstractControl): boolean {
    return ctrl.invalid && (ctrl.dirty || ctrl.touched);
  }
}
