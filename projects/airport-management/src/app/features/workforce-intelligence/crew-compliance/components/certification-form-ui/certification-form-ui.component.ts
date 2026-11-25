

import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    computed,
    input,
    output,
    signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ICreateCertificationDto } from '@shared-core';

interface IFormErrors {
    certificationName?: string;
    type?: string;
    issueDate?: string;
    expiryDate?: string;
}

@Component({
    selector: 'aoms-certification-form-ui',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, FormsModule],
    templateUrl: './certification-form-ui.component.html',
    styleUrl: './certification-form-ui.component.scss',
})
export class CertificationFormUiComponent implements OnInit {

    // ── Inputs ────────────────────────────────────────────────────────────
    readonly editingCertId = input<number | null>(null);
    readonly initialData = input<ICreateCertificationDto | null>(null);
    readonly isProcessing = input<boolean>(false);

    // ── Outputs ───────────────────────────────────────────────────────────
    readonly formSubmitted = output<ICreateCertificationDto>();
    readonly formCancelled = output<void>();

    // ── Form field signals ────────────────────────────────────────────────
    protected readonly certName = signal<string>('');
    protected readonly type = signal<string>('');
    protected readonly issueDate = signal<string>('');
    protected readonly expiryDate = signal<string>('');
    protected readonly touched = signal<boolean>(false);

    // ── Computed: mode label ──────────────────────────────────────────────
    protected readonly isEditMode = computed<boolean>(() => this.editingCertId() !== null);

    protected readonly dialogTitle = computed<string>(() =>
        this.isEditMode() ? 'Amend Credential Authorization' : 'Log New Credential'
    );

    protected readonly submitLabel = computed<string>(() =>
        this.isEditMode() ? 'Authorize Amendment' : 'Authorize Credential'
    );

    // ── Real-time validation ──────────────────────────────────────────────
    protected readonly errors = computed<IFormErrors>(() => {
        if (!this.touched()) return {};
        const errs: IFormErrors = {};
        if (!this.certName().trim()) {
            errs.certificationName = 'Credential name is required.';
        }
        if (!this.type().trim()) {
            errs.type = 'Credential category is required.';
        }
        const issue = this.issueDate();
        const expiry = this.expiryDate();
        if (!issue) {
            errs.issueDate = 'Issue date is required.';
        }
        if (!expiry) {
            errs.expiryDate = 'Expiry date is required.';
        } else if (issue && new Date(expiry) <= new Date(issue)) {
            errs.expiryDate = 'Invalid Expiry Date: Must be after the issue date.';
        } else if (new Date(expiry) < new Date()) {
            errs.expiryDate = 'Invalid Expiry Date: Must be in the future.';
        }
        return errs;
    });

    protected readonly isValid = computed<boolean>(() => {
        const e = this.errors();
        return Object.keys(e).length === 0 &&
            !!this.certName().trim() && !!this.type().trim() && !!this.issueDate() && !!this.expiryDate();
    });

    // ── Lifecycle: pre-fill when editing ─────────────────────────────────
    ngOnInit(): void {
        const data = this.initialData();
        if (data) {
            this.certName.set(data.certificationName);
            this.type.set(data.type || '');
            this.issueDate.set(this.toInputDate(data.issueDate));
            this.expiryDate.set(this.toInputDate(data.expiryDate));
        }
    }

    // ── Field handlers ────────────────────────────────────────────────────
    protected onNameInput(e: Event): void {
        this.certName.set((e.target as HTMLInputElement).value);
    }
    protected onTypeInput(e: Event): void {
        this.type.set((e.target as HTMLInputElement).value);
    }
    protected onIssueDateInput(e: Event): void {
        this.issueDate.set((e.target as HTMLInputElement).value);
    }
    protected onExpiryDateInput(e: Event): void {
        this.expiryDate.set((e.target as HTMLInputElement).value);
    }

    // ── Submit ────────────────────────────────────────────────────────────
    protected onSubmit(): void {
        this.touched.set(true);
        if (!this.isValid()) return;

        // Convert YYYY-MM-DD from input to ISO-8601 for the backend
        const issue = new Date(this.issueDate());
        const expiry = new Date(this.expiryDate());

        this.formSubmitted.emit({
            certificationName: this.certName().trim(),
            type: this.type().trim(),
            issueDate: issue.toISOString(),
            expiryDate: expiry.toISOString(),
        });
    }

    // ── Cancel ───────────────────────────────────────────────────────────
    protected onCancel(): void {
        this.formCancelled.emit();
    }

    // ── Backdrop click: close if clicking overlay (not dialog itself) ─────
    protected onBackdropClick(event: MouseEvent): void {
        if ((event.target as HTMLElement).classList.contains('form-backdrop')) {
            this.onCancel();
        }
    }

    // ── Helper: convert ISO date to yyyy-MM-dd for <input type="date"> ───
    private toInputDate(iso: string): string {
        if (!iso) return '';
        return iso.startsWith('T') ? '' : iso.slice(0, 10);
    }
}
