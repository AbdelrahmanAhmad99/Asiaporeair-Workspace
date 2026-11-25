
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, EMPTY, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { environment } from '../../../../environments/environment';
import {
  OperationsFeedEvent,
  OperationsFeedGateway,
  OperationsSnapshot,
  TrendDirection,
  OperationalDomain,
  ServiceStatus,
} from '../models/operations-center.models';


function createDevSnapshot(): OperationsSnapshot {
  const now = Date.now();
  const svc = { status: ServiceStatus.OPERATIONAL, latencyMs: 12, checkedAt: now };
  return {
    systemHealth: {
      apiGateway: svc,
      webSocketStream: svc,
      database: svc,
      occServer: svc,
      domainGateways: {
        [OperationalDomain.NETWORK]: svc,
        [OperationalDomain.FLEET]: svc,
        [OperationalDomain.WORKFORCE]: svc,
        [OperationalDomain.PLANNING]: svc,
        [OperationalDomain.COMMERCIAL]: svc,
        [OperationalDomain.RESERVATION]: svc,
      },
    },
    kpis: {
      activeFlights: { total: 48, delta: 3, forecastTotal: 51 },
      otpRate: {
        percentage: 91.4,
        trend: TrendDirection.UP,
        trendDeltaPct: 1.2,
        forecastPercentage: 92,
        averageDelayMinutes: 6.3,
        delayVarianceMinutes: 2.1,
      },
      fleetAvailability: {
        readinessRatio: 0.87,
        availableAircraft: 34,
        totalAircraft: 39,
        inMaintenanceCount: 4,
        aogCount: 1,
        forecastReadinessRatio: 0.9,
      },
      crew: {
        rosteredToday: 312,
        onDutyNow: 287,
        standbyAvailable: 24,
        expiringCertifications: 7,
        dutyCompliancePct: 98.2,
        forecastDutyCompliancePct: 98.5,
      },
      network: {
        activeAirports: 68,
        operationalRoutes: 142,
        restrictedAirports: 2,
        hubsOperational: 6,
        hubsTotal: 6,
        forecastOperationalRoutes: 145,
      },
      revenue: {
        dailyRevenue: 4_320_000,
        currency: 'SGD',
        deltaPct: 3.7,
        forecastRevenue: 4_500_000,
        yieldPerRpk: 0.082,
        forecastYieldPerRpk: 0.085,
        activePricingRules: 214,
      },
      reservations: { bookingsToday: 1_842, checkInRatePct: 74.1, activeGates: 18, totalGates: 24 },
      generatedAt: now,
    },
    airborneFleet: [],
    alerts: [],
    generatedAt: now,
  };
}

// ─────────────────────────────────────────────────────────────────────────────

@Injectable()
export class HttpWsOperationsFeedGateway implements OperationsFeedGateway {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/operations-center`;

  loadSnapshot(): Observable<OperationsSnapshot> {
    return of(createDevSnapshot());
  }


  connect(): Observable<OperationsFeedEvent> {
    return EMPTY;
  }

  acknowledgeAlert(alertId: string): Observable<void> {
    return this.http
      .post<void>(`${this.baseUrl}/alerts/${alertId}/acknowledge`, {})
      .pipe(
        catchError(() => {
          throw new Error(`[Gateway] Failed to acknowledge alert ${alertId}`);
        }),
      );
  }
}
