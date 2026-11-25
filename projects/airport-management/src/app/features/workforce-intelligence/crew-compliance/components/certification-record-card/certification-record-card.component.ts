

import {
    ChangeDetectionStrategy,
    Component,
    computed,
    input,
    output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ICertificationDto, ICreateCertificationDto } from '@shared-core';

// ── Cert validity states (drives neon glow class) ─────────────────────────
type CertState = 'active' | 'expiring' | 'expired';

const EXPIRY_WARN_DAYS = 60;

@Component({
    selector: 'aoms-certification-record-card',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule],
    templateUrl: './certification-record-card.component.html',
    styleUrl: './certification-record-card.component.scss',
})
export class CertificationRecordCardComponent {

    // ── Inputs ────────────────────────────────────────────────────────────
    readonly cert = input.required<ICertificationDto>();
    readonly isProcessing = input<boolean>(false);

    // ── Outputs ───────────────────────────────────────────────────────────
    readonly editRequested = output<{ certId: number; data: ICreateCertificationDto }>();
    readonly deleteRequested = output<{ certId: number; certName: string }>();

    // ── Computed: derive validity state ──────────────────────────────────
    protected readonly certState = computed<CertState>(() => {
        const c = this.cert();
        const now = Date.now();
        const expiry = new Date(c.expiryDate).getTime();

        if (!c.isValid || expiry < now) return 'expired';
        const diffDays = (expiry - now) / (1000 * 60 * 60 * 24);
        if (diffDays <= EXPIRY_WARN_DAYS) return 'expiring';
        return 'active';
    });

    protected readonly stateLabel = computed<string>(() => {
        const s = this.certState();
        if (s === 'active') return 'Active';
        if (s === 'expiring') return 'Expiring Soon';
        return 'Expired';
    });

    protected readonly daysRemaining = computed<number>(() => {
        const expiry = new Date(this.cert().expiryDate).getTime();
        return Math.ceil((expiry - Date.now()) / (1000 * 60 * 60 * 24));
    });

    // ── Format date display ───────────────────────────────────────────────
    protected formatDate(iso: string): string {
        return new Date(iso).toLocaleDateString('en-SG', {
            day: '2-digit', month: 'short', year: 'numeric',
        });
    }

    // ── Actions ───────────────────────────────────────────────────────────
    protected onEdit(): void {
        const c = this.cert();
        this.editRequested.emit({
            certId: c.certId,
            data: {
                certificationName: c.certificationName,
                type: c.type,
                issueDate: c.issueDate,
                expiryDate: c.expiryDate,
            },
        });
    }

    protected onDelete(): void {
        const c = this.cert();
        this.deleteRequested.emit({ certId: c.certId, certName: c.certificationName });
    }
}
