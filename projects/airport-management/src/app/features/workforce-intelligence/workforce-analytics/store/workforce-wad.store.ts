

import { Injectable, computed, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, map, switchMap, tap } from 'rxjs';

import { EmployeeService } from '@shared-core';
import {
    IEmployeeAnalyticsDto, IEmployeeSummaryDto,
} from '@shared-core';

import { CrewService } from '@shared-core';

// ── Derived types ─────────────────────────────────────────────────────────

export interface IRoleChartSlice {
    role: string;
    label: string;
    count: number;
    pct: number;            // 0–100
    colorKey: string;
    iconPath: string;
}

export interface IDepartmentChartSlice {
    dept: string;
    count: number;
    pct: number;
}

export interface IDashboardKpis {
    totalWorkforce: number;
    activeCount: number;
    activePct: number;          // 0–100
    complianceScore: number;          // derived: activePct rounded
    pilotCount: number;
    attendantCount: number;
    adminCount: number;
    roleSlices: IRoleChartSlice[];
    deptSlices: IDepartmentChartSlice[];
    topDept: string;
    growthNote: string;
}

export interface ICrewAnalyticsDto {
    // New Backend Fields
    totalActiveCrew?: number;
    totalPilots?: number;
    totalAttendants?: number;
    crewCountByBase?: { [iata: string]: number };
    certificationsExpiringSoon?: number;
    certificationsExpired?: number;

    // Old/Alternative Fields
    totalCrewMembers?: number;
    activeCrewMembers?: number;
    availableCrewMembers?: number;
    pilotsCount?: number;
    attendantsCount?: number;
    averageFlightHoursMonth?: number;
    flightCoverageRatio?: number;    // 0.0–1.0  (API decimal, not pct)
    restPeriodCompliancePct?: number;    // 0–100
    crewByBase?: { [iata: string]: number };
    onLeaveCount?: number;
    trainingCount?: number;
    standbyCount?: number;
    lastUpdated?: string;
}

export interface ICrewIntelligenceKpis {
    totalCrew: number;
    activeCrew: number;
    availableCrew: number;
    readinessPct: number;       // availableCrewMembers / totalCrewMembers * 100
    pilotCount: number;
    attendantCount: number;
    avgFlightHours: number;
    flightCoveragePct: number;       // flightCoverageRatio * 100
    restCompliancePct: number;
    onLeave: number;
    training: number;
    standby: number;
    baseBreakdown: Array<{ iata: string; count: number; pct: number }>;
    readinessStatus: 'optimal' | 'nominal' | 'strained' | 'critical';
    readinessLabel: string;
    lastUpdated: string | null;
    expiringCerts: number;
    expiredCerts: number;
    // Pre-computed SVG arc data — keeps dumb components purely presentational
    gaugeArcPath: string;
    gaugeCircumference: number;
    gaugeDashOffset: number;
}

export interface IReportDateRange {
    start: Date;
    end: Date;
}

// Month-bucketed data point for the SVG line chart
export interface IHiringMonthPoint {
    monthKey: string;       // "2024-03" ISO month
    label: string;       // "Mar '24"
    count: number;
    employees: IEmployeeSummaryDto[];
    x: number;       // 0–100 normalised SVG coordinate
    y: number;       // 0–100 normalised SVG coordinate (inverted)
}

// Aggregation by role for the report summary strip
export interface IHiringRoleBreakdown {
    role: string;
    count: number;
    pct: number;
}

// Full computed report shape consumed by the dumb components
export interface IRecruitmentReport {
    totalHired: number;
    dateRange: IReportDateRange;
    monthPoints: IHiringMonthPoint[];
    peakMonth: IHiringMonthPoint | null;
    avgPerMonth: number;
    roleBreakdown: IHiringRoleBreakdown[];
    deptBreakdown: Array<{ dept: string; count: number; pct: number }>;
    // SVG polyline path string (pre-computed, 0-100 coordinate space)
    svgPolylinePath: string;
    svgAreaPath: string;          // closed area beneath the line
    hasData: boolean;
}


// ── Role display config ────────────────────────────────────────────────────
const ROLE_CONFIG: Record<string, { label: string; colorKey: string; iconPath: string }> = {
    pilot: { label: 'Pilots', colorKey: 'cobalt', iconPath: 'M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12zm0 0h7.5' },
    attendant: { label: 'Cabin Crew', colorKey: 'emerald', iconPath: 'M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0zM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632z' },
    admin: { label: 'Admins', colorKey: 'gold', iconPath: 'M9 12.75 11.25 15 15 9.75m-10.5.75a8.25 8.25 0 1 1 16.5 0 8.25 8.25 0 0 1-16.5 0z' },
    supervisor: { label: 'Supervisors', colorKey: 'violet', iconPath: 'M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z' },
    superadmin: { label: 'Super Admins', colorKey: 'amber', iconPath: 'M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172' },
    other: { label: 'Other', colorKey: 'slate', iconPath: 'M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584' },
};

function resolveRole(raw: string): keyof typeof ROLE_CONFIG {
    const k = raw.toLowerCase().replace(/\s/g, '');
    if (k.includes('pilot')) return 'pilot';
    if (k.includes('attend')) return 'attendant';
    if (k.includes('superadmin')) return 'superadmin';
    if (k.includes('admin')) return 'admin';
    if (k.includes('super')) return 'supervisor';
    return 'other';
}

@Injectable({ providedIn: 'root' })
export class WorkforceWadStore {
    private readonly employeeService = inject(EmployeeService);
    private readonly destroyRef = inject(DestroyRef);

    // ── Private Writable Signals ─────────────────────────────────────
    private readonly _analytics = signal<IEmployeeAnalyticsDto | null>(null);
    private readonly _isLoading = signal<boolean>(false);
    private readonly _analyticsError = signal<string | null>(null);
    private readonly _lastRefreshed = signal<Date | null>(null);

    private readonly crewService = inject(CrewService);
    private readonly _crewAnalytics = signal<ICrewAnalyticsDto | null>(null);
    private readonly _crewDataLoading = signal<boolean>(false);
    private readonly _crewDataError = signal<string | null>(null);

    private readonly _hiringData = signal<IEmployeeSummaryDto[]>([]);
    private readonly _reportDateRange = signal<IReportDateRange>({
        start: (() => { const d = new Date(); d.setMonth(d.getMonth() - 6); d.setDate(1); return d; })(),
        end: new Date(),
    });
    private readonly _isReportLoading = signal<boolean>(false);
    private readonly _reportError = signal<string | null>(null);
    private readonly _reportInitialized = signal<boolean>(false);

    // ── Public Read-Only ─────────────────────────────────────────────
    readonly analytics = this._analytics.asReadonly();
    readonly isLoading = this._isLoading.asReadonly();
    readonly analyticsError = this._analyticsError.asReadonly();
    readonly lastRefreshed = this._lastRefreshed.asReadonly();

    readonly crewAnalytics = this._crewAnalytics.asReadonly();
    readonly crewDataLoading = this._crewDataLoading.asReadonly();
    readonly crewDataError = this._crewDataError.asReadonly();

    // Convenience alias for the gauge component
    readonly readinessPercentage = computed(() => this.crewKpis()?.readinessPct ?? 0);


    readonly hiringData = this._hiringData.asReadonly();
    readonly reportDateRange = this._reportDateRange.asReadonly();
    readonly isReportLoading = this._isReportLoading.asReadonly();
    readonly reportError = this._reportError.asReadonly();
    readonly reportInitialized = this._reportInitialized.asReadonly();

    // ── Computed KPIs ─────────────────────────────────────────────────
    readonly kpis = computed<IDashboardKpis | null>(() => {
        const a = this._analytics();
        if (!a) return null;

        // Support both old and new field names
        const active = a.totalActiveEmployees ?? a.activeEmployees ?? 0;
        const total = a.totalEmployees ?? active; // fallback to active if total is missing
        const activePct = total > 0 ? Math.round((active / total) * 100) : 0;
        const compliance = activePct;

        // Reconstruct byRole if missing
        let byRole = a.employeesByRole;
        if (!byRole && (a.totalPilots !== undefined)) {
            byRole = {
                'Pilot': a.totalPilots ?? 0,
                'Attendant': a.totalAttendants ?? 0,
                'Admin': a.totalAdmins ?? 0,
                'Supervisor': a.totalSupervisors ?? 0,
            };
            // If totalActiveEmployees > sum of roles, add "Other"
            const knownSum = (a.totalPilots ?? 0) + (a.totalAttendants ?? 0) + (a.totalAdmins ?? 0) + (a.totalSupervisors ?? 0);
            if (active > knownSum) {
                byRole['Other'] = active - knownSum;
            }
        }
        byRole = byRole ?? {};

        const roleSlices: IRoleChartSlice[] = Object.entries(byRole)
            .map(([raw, count]) => {
                const key = resolveRole(raw);
                const cfg = ROLE_CONFIG[key];
                return {
                    role: raw,
                    label: cfg.label,
                    count,
                    pct: total > 0 ? Math.round((count / total) * 1000) / 10 : 0,
                    colorKey: cfg.colorKey,
                    iconPath: cfg.iconPath,
                };
            })
            .sort((a, b) => b.count - a.count);

        // Reconstruct byDept/Base
        const byDept = a.employeesByDepartment ?? a.employeesByBase ?? {};
        const deptSlices: IDepartmentChartSlice[] = Object.entries(byDept)
            .map(([dept, count]) => ({
                dept, count,
                pct: total > 0 ? Math.round((count / total) * 1000) / 10 : 0,
            }))
            .sort((a, b) => b.count - a.count);

        const topDept = deptSlices[0]?.dept ?? '—';

        // Role-specific counters (using colorKey to group)
        const pilotCount = roleSlices.filter(r => r.colorKey === 'cobalt').reduce((s, r) => s + r.count, 0);
        const attendantCount = roleSlices.filter(r => r.colorKey === 'emerald').reduce((s, r) => s + r.count, 0);
        const adminCount = roleSlices.filter(r => r.colorKey === 'gold' || r.colorKey === 'amber').reduce((s, r) => s + r.count, 0);

        return {
            totalWorkforce: total,
            activeCount: active,
            activePct,
            complianceScore: compliance,
            pilotCount,
            attendantCount,
            adminCount,
            roleSlices,
            deptSlices,
            topDept,
            growthNote: active > 0 && total > 0
                ? `${activePct}% operational readiness`
                : 'Data pending',
        };
    });


    readonly crewKpis = computed<ICrewIntelligenceKpis | null>(() => {
        const raw = this._crewAnalytics();
        if (!raw) return null;

        // Support both old and new field names
        const active = raw.totalActiveCrew ?? raw.activeCrewMembers ?? 0;
        const total = raw.totalCrewMembers ?? active; // fallback to active if total missing
        const available = raw.availableCrewMembers ?? active; // fallback to active if available missing

        const readiness = total > 0 ? Math.round((available / total) * 100) : 0;
        const coveragePct = Math.min(100, Math.round((raw.flightCoverageRatio ?? 1.0) * 100));

        const readinessStatus: ICrewIntelligenceKpis['readinessStatus'] =
            readiness >= 90 ? 'optimal' :
                readiness >= 75 ? 'nominal' :
                    readiness >= 55 ? 'strained' : 'critical';

        const readinessLabel =
            readinessStatus === 'optimal' ? 'Optimal Readiness' :
                readinessStatus === 'nominal' ? 'Nominal Readiness' :
                    readinessStatus === 'strained' ? 'Strained — Monitor' : 'Critical — Action Required';

        const byBase = raw.crewCountByBase ?? raw.crewByBase ?? {};
        const baseBreakdown = Object.entries(byBase)
            .map(([iata, count]) => ({
                iata,
                count: count as number,
                pct: total > 0 ? Math.round(((count as number) / total) * 100) : 0,
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 8);

        // SVG gauge pre-computation
        const r = 52;
        const circ = +(2 * Math.PI * r).toFixed(2);
        const cx = 60; const cy = 60;
        const startAngle = -Math.PI / 2;
        const endAngle = startAngle + (readiness / 100) * 2 * Math.PI;
        const x1 = +(cx + r * Math.cos(startAngle)).toFixed(3);
        const y1 = +(cy + r * Math.sin(startAngle)).toFixed(3);
        const x2 = +(cx + r * Math.cos(endAngle)).toFixed(3);
        const y2 = +(cy + r * Math.sin(endAngle)).toFixed(3);
        const large = readiness > 50 ? 1 : 0;
        const arcPath = `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;

        return {
            totalCrew: total,
            activeCrew: active,
            availableCrew: available,
            readinessPct: readiness,
            pilotCount: raw.totalPilots ?? raw.pilotsCount ?? 0,
            attendantCount: raw.totalAttendants ?? raw.attendantsCount ?? 0,
            avgFlightHours: Math.round((raw.averageFlightHoursMonth ?? 0) * 10) / 10,
            flightCoveragePct: coveragePct,
            restCompliancePct: Math.round(raw.restPeriodCompliancePct ?? 100),
            onLeave: raw.onLeaveCount || 0,
            training: raw.trainingCount || 0,
            standby: raw.standbyCount || 0,
            baseBreakdown,
            readinessStatus,
            readinessLabel,
            lastUpdated: raw.lastUpdated ?? null,
            expiringCerts: raw.certificationsExpiringSoon ?? 0,
            expiredCerts: raw.certificationsExpired ?? 0,
            gaugeArcPath: arcPath,
            gaugeCircumference: circ,
            gaugeDashOffset: +(circ - circ * (readiness / 100)).toFixed(2),
        };
    });

    readonly recruitmentReport = computed<IRecruitmentReport>(() => {
        const employees = this._hiringData();
        const range = this._reportDateRange();
        const total = employees.length;

        if (!total) {
            return {
                totalHired: 0, dateRange: range, monthPoints: [],
                peakMonth: null, avgPerMonth: 0,
                roleBreakdown: [], deptBreakdown: [],
                svgPolylinePath: '', svgAreaPath: '',
                hasData: false,
            };
        }

        // ── Group employees by ISO month ─────────────────────────────────
        const buckets = new Map<string, IEmployeeSummaryDto[]>();
        for (const emp of employees) {
            const d = new Date(emp.hireDate ?? emp.dateOfHire ?? 0);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const arr = buckets.get(key) ?? [];
            arr.push(emp);
            buckets.set(key, arr);
        }

        // Fill in all months in the range (even with 0) for a continuous line
        const filledBuckets = new Map<string, IEmployeeSummaryDto[]>();
        const cursor = new Date(range.start);
        cursor.setDate(1);
        const rangeEnd = new Date(range.end);
        while (cursor <= rangeEnd) {
            const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`;
            filledBuckets.set(key, buckets.get(key) ?? []);
            cursor.setMonth(cursor.getMonth() + 1);
        }

        const sortedKeys = [...filledBuckets.keys()].sort();
        const maxCount = Math.max(...sortedKeys.map(k => (filledBuckets.get(k) ?? []).length), 1);

        // ── SVG coordinate computation (100×60 viewport) ─────────────────
        const SVG_W = 100; const SVG_H = 60; const PAD = 5;
        const usableW = SVG_W - PAD * 2;
        const usableH = SVG_H - PAD * 2;

        const monthPoints: IHiringMonthPoint[] = sortedKeys.map((key, i) => {
            const emps = filledBuckets.get(key) ?? [];
            const date = new Date(key + '-01');
            const label = date.toLocaleString('en-SG', { month: 'short', year: '2-digit' });
            const xNorm = sortedKeys.length > 1
                ? (i / (sortedKeys.length - 1)) * usableW + PAD
                : SVG_W / 2;
            const yNorm = SVG_H - PAD - (emps.length / maxCount) * usableH;
            return { monthKey: key, label, count: emps.length, employees: emps, x: xNorm, y: yNorm };
        });

        // ── SVG path strings ──────────────────────────────────────────────
        const svgPolylinePath = monthPoints
            .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
            .join(' ');

        const bottomY = SVG_H - PAD;
        const firstX = monthPoints[0]?.x.toFixed(2) ?? PAD;
        const lastX = monthPoints.at(-1)?.x.toFixed(2) ?? SVG_W - PAD;
        const svgAreaPath = svgPolylinePath
            + ` L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;

        // ── Role & Dept aggregation ───────────────────────────────────────
        const roleCounts: Record<string, number> = {};
        const deptCounts: Record<string, number> = {};
        for (const emp of employees) {
            const role = emp.role || emp.position || 'Unknown';
            const dept = emp.department || emp.crewBaseAirportIata || 'N/A';
            roleCounts[role] = (roleCounts[role] ?? 0) + 1;
            deptCounts[dept] = (deptCounts[dept] ?? 0) + 1;
        }

        const roleBreakdown: IHiringRoleBreakdown[] = Object.entries(roleCounts)
            .map(([role, count]) => ({ role, count, pct: Math.round((count / total) * 100) }))
            .sort((a, b) => b.count - a.count);

        const deptBreakdown = Object.entries(deptCounts)
            .map(([dept, count]) => ({ dept, count, pct: Math.round((count / total) * 100) }))
            .sort((a, b) => b.count - a.count);

        const peakMonth = [...monthPoints].sort((a, b) => b.count - a.count)[0] ?? null;
        const avgPerMonth = Math.round((total / Math.max(sortedKeys.length, 1)) * 10) / 10;

        return {
            totalHired: total, dateRange: range, monthPoints,
            peakMonth, avgPerMonth, roleBreakdown, deptBreakdown,
            svgPolylinePath, svgAreaPath, hasData: true,
        };
    });

    // ── Actions ────────────────────────────────────────────────────────

    loadDashboardAnalytics(): void {
        this._isLoading.set(true);
        this._analyticsError.set(null);

        this.employeeService.getEmployeeDashboardAnalytics()
            .pipe(
                catchError(err => {
                    this._analyticsError.set(this.handleError(err));
                    this._isLoading.set(false);
                    return EMPTY;
                }),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe(data => {
                this._analytics.set(data);
                this._isLoading.set(false);
                this._lastRefreshed.set(new Date());
            });
    }

    /**
     * Parses backend errors into luxury-register strategic messages.
     */
    handleError(err: { status?: number; message?: string; error?: { message?: string } }): string {
        const code = err?.status;
        const detail = err?.error?.message ?? err?.message ?? '';

        if (!code || code === 0 || code === 503) {
            return `Strategic Data Stream Interrupted — the workforce analytics pipeline is currently performing a scheduled data consolidation. The intelligence system will re-establish automatically. Please retry in 60 seconds.`;
        }
        if (code === 403 || code === 401) {
            return `Clearance Barrier — your executive access level does not include real-time workforce intelligence for this data scope. Contact the system administrator to elevate your authorization.`;
        }
        if (code === 404) {
            return `Intelligence Matrix Unavailable — the analytics data source could not be located. The workforce database may be undergoing a migration cycle.`;
        }
        if (code === 500 || code === 502) {
            return `Analytics Engine Fault — the workforce intelligence server encountered an internal computation error. ${detail ? `Details: ${detail}` : 'The operations team has been notified.'}`;
        }
        return `Strategic Data Link Failure — ${detail || 'workforce analytics encountered an unexpected synchronisation barrier. Please re-establish the data link.'}`;
    }

    // ===========================================================================
    // CREW INTELLIGENCE HUB ACTIONS
    // ===========================================================================

    loadCrewIntelligenceData(): void {
        this._crewDataLoading.set(true);
        this._crewDataError.set(null);

        this.crewService.getCrewDashboardAnalytics()
            .pipe(
                catchError(err => {
                    this._crewDataError.set(this._handleCrewError(err));
                    this._crewDataLoading.set(false);
                    return EMPTY;
                }),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe((raw: ICrewAnalyticsDto) => {
                this._crewAnalytics.set(raw);
                this._crewDataLoading.set(false);
            });
    }

    clearCrewError(): void {
        this._crewDataError.set(null);
    }

    private _handleCrewError(err: { status?: number; message?: string; error?: { message?: string } }): string {
        const code = err?.status;
        const detail = err?.error?.message ?? err?.message ?? '';

        if (!code || code === 0 || code === 503) {
            return `Operational Data Stream Offline — the crew readiness pipeline is performing a scheduled synchronisation cycle. Cockpit instruments will restore automatically within 60 seconds.`;
        }
        if (code === 403 || code === 401) {
            return `Clearance Barrier — your access tier does not include real-time crew operational data. Contact the Chief Operations Officer to elevate your intelligence clearance.`;
        }
        if (code === 404) {
            return `Crew Intelligence Matrix Unavailable — the operational data source could not be located. The crew database may be undergoing a maintenance cycle.`;
        }
        if (code === 500 || code === 502) {
            return `Crew Analytics Engine Fault — ${detail ? `System detail: ${detail}` : 'The flight operations team has been notified.'}`;
        }
        return `Operational Intelligence Barrier — ${detail || 'crew readiness data synchronisation encountered an unexpected barrier. Please re-initialise the system.'}`;
    }

    loadRecruitmentReport(range: IReportDateRange): void {
        this._isReportLoading.set(true);
        this._reportError.set(null);
        this._reportDateRange.set(range);

        this.employeeService
            .getEmployeesHiredByDateRange(range.start, range.end)
            .pipe(
                catchError(err => {
                    this._reportError.set(this._handleReportError(err));
                    this._isReportLoading.set(false);
                    return EMPTY;
                }),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe((data: IEmployeeSummaryDto[]) => {
                const mapped: IEmployeeSummaryDto[] = (data ?? []).map(e => ({
                    ...e,
                    firstName: e.firstName ?? '',
                    lastName: e.lastName ?? '',
                    hireDate: e.hireDate || e.dateOfHire || '',
                    department: e.department || e.crewBaseAirportIata || 'N/A',
                    role: e.role || e.position || 'Unknown',
                    baseSalary: e.baseSalary || (typeof e.salary === 'string' ? parseFloat(e.salary) : e.salary) || 0
                }));
                this._hiringData.set(mapped);
                this._isReportLoading.set(false);
                this._reportInitialized.set(true);
            });
    }

    updateReportRange(range: IReportDateRange): void {
        // De-duplicate: skip if range is identical to current
        const curr = this._reportDateRange();
        if (curr.start.getTime() === range.start.getTime() &&
            curr.end.getTime() === range.end.getTime()) return;
        this.loadRecruitmentReport(range);
    }

    clearReportError(): void {
        this._reportError.set(null);
    }

    private _handleReportError(err: { status?: number; message?: string; error?: { message?: string } }): string {
        const code = err?.status;
        const detail = err?.error?.message ?? err?.message ?? '';

        if (!code || code === 0 || code === 503) {
            return `Historical Data Retrieval Failed — the recruitment analytics pipeline is performing a scheduled data consolidation. The system will re-establish connectivity shortly.`;
        }
        if (code === 400) {
            return `Date Range Constraint — ${detail || 'the selected date range exceeds the allowable reporting window or contains invalid parameters.'}`;
        }
        if (code === 403 || code === 401) {
            return `Clearance Barrier — your access tier does not include historical hiring records for this scope. Contact the HR Director to elevate your reporting clearance.`;
        }
        if (code === 404) {
            return `Recruitment Records Unavailable — no hiring data was found in the workforce registry for the selected period.`;
        }
        if (code === 500 || code === 502) {
            return `Analytics Engine Fault — the workforce intelligence server encountered an internal error while retrieving recruitment records. ${detail ? `Detail: ${detail}` : ''}`;
        }
        return `Historical Data Link Failure — ${detail || 'the recruitment trend pipeline encountered an unexpected synchronisation barrier.'}`;
    }




}