
import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    inject,
    signal,
    computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import {
    animate,
    query,
    stagger,
    style,
    transition,
    trigger,
} from '@angular/animations';

import { CrewComplianceStore } from '../../store/crew-compliance.store';
import { ICreateCertificationDto } from '@shared-core';

import { CrewBaseManagerComponent } from '../../components/crew-base-manager/crew-base-manager.component';
import { CertificationRecordCardComponent } from '../../components/certification-record-card/certification-record-card.component';
import { CertificationFormUiComponent } from '../../components/certification-form-ui/certification-form-ui.component';

// ── Staggered card entry animation ────────────────────────────────────────
export const cardStaggerAnim = trigger('cardStagger', [
    transition('* => *', [
        query(':enter', [
            style({ opacity: 0, transform: 'translateY(20px)' }),
            stagger(60, [
                animate(
                    '350ms cubic-bezier(0.4,0,0.2,1)',
                    style({ opacity: 1, transform: 'translateY(0)' })
                ),
            ]),
        ], { optional: true }),
    ]),
]);

// ── Banner slide-in/out ───────────────────────────────────────────────────
export const bannerAnim = trigger('bannerAnim', [
    transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-12px)', maxHeight: '0' }),
        animate(
            '300ms cubic-bezier(0.4,0,0.2,1)',
            style({ opacity: 1, transform: 'translateY(0)', maxHeight: '120px' })
        ),
    ]),
    transition(':leave', [
        animate(
            '200ms ease-in',
            style({ opacity: 0, transform: 'translateY(-8px)', maxHeight: '0' })
        ),
    ]),
]);

// ── Delete confirmation dialog state ──────────────────────────────────────
interface IDeleteConfirm {
    certId: number;
    certName: string;
}

@Component({
    selector: 'aoms-crew-technical-profile',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        CrewBaseManagerComponent,
        CertificationRecordCardComponent,
        CertificationFormUiComponent,
    ],
    animations: [cardStaggerAnim, bannerAnim],
    templateUrl: './crew-technical-profile.component.html',
    styleUrl: './crew-technical-profile.component.scss',
})
export class CrewTechnicalProfileComponent implements OnInit {

    // ── Injections ────────────────────────────────────────────────────────
    protected readonly store = inject(CrewComplianceStore);
    private readonly route = inject(ActivatedRoute);

    // ── Store read-only signals ───────────────────────────────────────────
    protected readonly member = this.store.activeCrewMember;
    protected readonly certifications = this.store.memberCertifications;
    protected readonly airports = this.store.availableAirports;
    protected readonly isLoading = this.store.isLoading;
    protected readonly isProcessing = this.store.isProcessing;
    protected readonly feedback = this.store.feedbackMessage;
    protected readonly operationalError = this.store.operationalError;

    // ── Local UI signals ──────────────────────────────────────────────────
    protected readonly isCertFormOpen = signal<boolean>(false);
    /** Null = add mode; populated = edit mode */
    protected readonly editingCertId = signal<number | null>(null);
    /** Cert data pre-filled when editing */
    protected readonly editingCertData = signal<ICreateCertificationDto | null>(null);
    /** Delete-confirmation dialog state */
    protected readonly deleteConfirm = signal<IDeleteConfirm | null>(null);

    // ── Computed ──────────────────────────────────────────────────────────
    protected readonly fullName = computed(() => {
        const m = this.member();
        return m ? `${m.firstName} ${m.lastName}`.trim() : '—';
    });

    protected readonly certCount = computed(() => this.certifications().length);

    // ── Lifecycle ─────────────────────────────────────────────────────────
    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.store.loadFullProfile(id);
        }
    }

    // ── Base manager events ───────────────────────────────────────────────
    protected onBaseUpdated(airportIata: string): void {
        this.store.updateBase(airportIata);
    }

    // ── Certification form events ─────────────────────────────────────────
    protected onOpenAddForm(): void {
        this.editingCertId.set(null);
        this.editingCertData.set(null);
        this.isCertFormOpen.set(true);
    }

    protected onOpenEditForm(event: { certId: number; data: ICreateCertificationDto }): void {
        this.editingCertId.set(event.certId);
        this.editingCertData.set(event.data);
        this.isCertFormOpen.set(true);
    }

    protected onFormCancelled(): void {
        this.isCertFormOpen.set(false);
        this.editingCertId.set(null);
        this.editingCertData.set(null);
    }

    protected onFormSubmitted(dto: ICreateCertificationDto): void {
        const certId = this.editingCertId();
        if (certId != null) {
            this.store.manageCertification('update', { certId, dto });
        } else {
            this.store.manageCertification('add', { dto });
        }
        this.isCertFormOpen.set(false);
        this.editingCertId.set(null);
        this.editingCertData.set(null);
    }

    // ── Delete confirmation events ────────────────────────────────────────
    protected onDeleteRequested(event: { certId: number; certName: string }): void {
        this.deleteConfirm.set({ certId: event.certId, certName: event.certName });
    }

    protected onDeleteConfirmed(): void {
        const confirm = this.deleteConfirm();
        if (!confirm) return;
        this.store.manageCertification('delete', { certId: confirm.certId });
        this.deleteConfirm.set(null);
    }

    protected onDeleteCancelled(): void {
        this.deleteConfirm.set(null);
    }

    // ── Navigation ────────────────────────────────────────────────────────
    protected onBack(): void {
        this.store.navigateBackToDirectory();
    }

    // ── Feedback / error ─────────────────────────────────────────────────
    protected dismissFeedback(): void {
        this.store.clearFeedback();
    }

    protected dismissError(): void {
        this.store.clearError();
    }

    // ── Track by cert ─────────────────────────────────────────────────────
    protected trackByCert(_: number, cert: { certId: number }): number {
        return cert.certId;
    }
}
