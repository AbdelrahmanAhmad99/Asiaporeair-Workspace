export type CertUrgency = 'expired' | 'critical' | 'warning' | 'ok';

// ── Days thresholds exposed in the threshold selector ─────────────────────
export const WATCHDOG_THRESHOLDS: { value: number; label: string }[] = [
    { value: 30, label: '30 Days' },
    { value: 60, label: '60 Days' },
    { value: 90, label: '90 Days' },
    { value: 180, label: '180 Days' },
];

// ── A single certification at-risk record (UI-enriched) ───────────────────
export interface IExpiringCertRecord {
    /** Unique cert identifier from the backend. */
    certId: number;
    employeeId: number;
    appUserId: string;
    fullName: string;
    firstName: string;
    lastName: string;
    rank: string;
    position: string;
    baseAirportIata: string;
    isActive: boolean;

    // ── Certification fields ──────────────────────────────────────────────
    certificationName: string;
    certType: string;
    issueDate: string;
    expiryDate: string;
    /** False when expiryDate has already passed. */
    isValid: boolean;

    // ── Computed enrichment (client-side) ─────────────────────────────────
    /** Calendar days remaining until expiry. Negative = already expired. */
    daysRemaining: number;
    /** Urgency classification used by the neon badge. */
    urgency: CertUrgency;
}

// ── Store watchdog state slice ─────────────────────────────────────────────
export interface IWatchdogState {
    records: IExpiringCertRecord[];
    threshold: number;
    loading: boolean;
    error: string | null;
    fullyCompliant: boolean;
}

// ── Pure helper: compute days remaining ───────────────────────────────────
export function computeDaysRemaining(expiryDate: string): number {
    const expiry = new Date(expiryDate).getTime();
    const now = Date.now();
    return Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
}

// ── Pure helper: classify urgency ─────────────────────────────────────────
export function classifyUrgency(daysRemaining: number): CertUrgency {
    if (daysRemaining <= 0) return 'expired';
    if (daysRemaining <= 10) return 'critical';
    if (daysRemaining <= 30) return 'warning';
    return 'ok';
}

// ── Pure helper: map raw API object → IExpiringCertRecord ─────────────────
export function mapRawToExpiringCertRecord(raw: any): IExpiringCertRecord {
    // Support various backend field name conventions
    const firstName = raw.firstName || (raw.fullName || '').split(' ')[0] || 'Unknown';
    const lastName = raw.lastName || (raw.fullName || '').split(' ').slice(1).join(' ') || '';
    const fullName = raw.fullName || `${firstName} ${lastName}`.trim() || '—';

    const position = raw.position ?? raw.rank ?? raw.jobTitle ?? raw.role ?? '';
    const rank = position
        ? position.replace(/([A-Z])/g, ' $1').replace(/[_-]/g, ' ').trim()
        : '—';

    const certificationName = raw.certificationName ?? raw.type ?? raw.credential ?? 'Unspecified Credential';
    const certType = raw.certType ?? raw.category ?? raw.certificationCategory ?? 'Operational';
    const expiryDate = raw.expiryDate ?? raw.expirationDate ?? raw.validUntil ?? '';
    const issueDate = raw.issueDate ?? raw.issuedDate ?? '';
    const isValid = raw.isExpired != null ? !raw.isExpired : (raw.isValid ?? true);

    const daysRemaining = expiryDate ? computeDaysRemaining(expiryDate) : 0;
    const urgency = classifyUrgency(daysRemaining);

    return {
        certId: raw.certId ?? raw.id ?? 0,
        employeeId: raw.employeeId,
        appUserId: raw.appUserId ?? '',
        fullName,
        firstName,
        lastName,
        rank,
        position,
        baseAirportIata: raw.crewBaseAirportIata ?? raw.baseAirportIata ?? '—',
        isActive: raw.isActive ?? false,
        certificationName,
        certType,
        issueDate,
        expiryDate,
        isValid,
        daysRemaining,
        urgency,
    };
}