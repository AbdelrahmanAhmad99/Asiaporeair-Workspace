import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

import { IApiResponse } from '../../models/api-response.model';
import { logApiRequest, logApiResponse, handleApiError } from '../api-helpers';

import {
  ISalesSummaryReportDto, IFlightPerformanceReportDto, ILoadFactorReportDto,
  IOperationalDashboardDto, IFlightInstanceForFidsDto
} from '../../models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private readonly SERVICE_NAME = 'DashboardService';
  private readonly baseUrl = `${environment.apiUrl}/v1/admin/dashboard`;

  getOperationalDashboard(airportIataCode: string = 'SIN', date?: string | Date): Observable<IOperationalDashboardDto> {
    const url = `${this.baseUrl}/operational`;
    let params = new HttpParams().set('airportIataCode', airportIataCode);
    if (date) {
      const dateStr = date instanceof Date ? date.toISOString() : date;
      params = params.set('date', dateStr);
    }

    logApiRequest(this.SERVICE_NAME, 'getOperationalDashboard', url, { airportIataCode, date });
    return this.http.get<IApiResponse<IOperationalDashboardDto>>(url, { params }).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'getOperationalDashboard', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'getOperationalDashboard', err))
    );
  }

  getFidsDepartures(airportIataCode: string = 'SIN'): Observable<IFlightInstanceForFidsDto[]> {
    const url = `${this.baseUrl}/fids-departures`;
    const params = new HttpParams().set('airportIataCode', airportIataCode);

    logApiRequest(this.SERVICE_NAME, 'getFidsDepartures', url, { airportIataCode });
    return this.http.get<IApiResponse<IFlightInstanceForFidsDto[]>>(url, { params }).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'getFidsDepartures', res); return res?.data || []; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'getFidsDepartures', err))
    );
  }

  getFidsArrivals(airportIataCode: string = 'SIN'): Observable<IFlightInstanceForFidsDto[]> {
    const url = `${this.baseUrl}/fids-arrivals`;
    const params = new HttpParams().set('airportIataCode', airportIataCode);

    logApiRequest(this.SERVICE_NAME, 'getFidsArrivals', url, { airportIataCode });
    return this.http.get<IApiResponse<IFlightInstanceForFidsDto[]>>(url, { params }).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'getFidsArrivals', res); return res?.data || []; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'getFidsArrivals', err))
    );
  }

  getSalesSummaryReport(startDate?: string | Date, endDate?: string | Date, airlineIataCode?: string): Observable<ISalesSummaryReportDto> {
    const url = `${this.baseUrl}/sales-summary`;
    let params = new HttpParams();

    if (startDate) params = params.set('startDate', startDate instanceof Date ? startDate.toISOString() : startDate);
    if (endDate) params = params.set('endDate', endDate instanceof Date ? endDate.toISOString() : endDate);
    if (airlineIataCode) params = params.set('airlineIataCode', airlineIataCode);

    logApiRequest(this.SERVICE_NAME, 'getSalesSummaryReport', url, { startDate, endDate, airlineIataCode });
    return this.http.get<IApiResponse<ISalesSummaryReportDto>>(url, { params }).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'getSalesSummaryReport', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'getSalesSummaryReport', err))
    );
  }

  getFlightPerformanceReport(startDate?: string | Date, endDate?: string | Date, airportIataCode?: string): Observable<IFlightPerformanceReportDto> {
    const url = `${this.baseUrl}/performance-summary`;
    let params = new HttpParams();

    if (startDate) params = params.set('startDate', startDate instanceof Date ? startDate.toISOString() : startDate);
    if (endDate) params = params.set('endDate', endDate instanceof Date ? endDate.toISOString() : endDate);
    if (airportIataCode) params = params.set('airportIataCode', airportIataCode);

    logApiRequest(this.SERVICE_NAME, 'getFlightPerformanceReport', url, { startDate, endDate, airportIataCode });
    return this.http.get<IApiResponse<IFlightPerformanceReportDto>>(url, { params }).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'getFlightPerformanceReport', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'getFlightPerformanceReport', err))
    );
  }

  getLoadFactorReport(startDate?: string | Date, endDate?: string | Date): Observable<ILoadFactorReportDto> {
    const url = `${this.baseUrl}/loadfactor-summary`;
    let params = new HttpParams();

    if (startDate) params = params.set('startDate', startDate instanceof Date ? startDate.toISOString() : startDate);
    if (endDate) params = params.set('endDate', endDate instanceof Date ? endDate.toISOString() : endDate);

    logApiRequest(this.SERVICE_NAME, 'getLoadFactorReport', url, { startDate, endDate });
    return this.http.get<IApiResponse<ILoadFactorReportDto>>(url, { params }).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'getLoadFactorReport', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'getLoadFactorReport', err))
    );
  }
}
