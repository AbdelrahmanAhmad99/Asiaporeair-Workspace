import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

import { IApiResponse } from '../../models/api-response.model';
import { logApiRequest, logApiResponse, handleApiError } from '../api-helpers';

import { 
  IReportRequestDto, ISalesSummaryReportDto, IFlightPerformanceReportDto,
  ILoadFactorReportDto, IPassengerManifestDto
} from '../../models/reporting.model';

@Injectable({
  providedIn: 'root'
})
export class ReportingService {
  private http = inject(HttpClient);
  private readonly SERVICE_NAME = 'ReportingService';
  private readonly baseUrl = `${environment.apiUrl}/v1/admin/reports`;

  getSalesSummaryReport(request: IReportRequestDto): Observable<ISalesSummaryReportDto> {
    const url = `${this.baseUrl}/sales-summary`;
    const startStr = request.startDate instanceof Date ? request.startDate.toISOString() : request.startDate;
    const endStr = request.endDate instanceof Date ? request.endDate.toISOString() : request.endDate;
    let params = new HttpParams().set('startDate', startStr).set('endDate', endStr);
    
    if (request.airlineIataCode) params = params.set('airlineIataCode', request.airlineIataCode);
    if (request.airportIataCode) params = params.set('airportIataCode', request.airportIataCode);

    logApiRequest(this.SERVICE_NAME, 'getSalesSummaryReport', url, request);
    return this.http.get<IApiResponse<ISalesSummaryReportDto>>(url, { params }).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'getSalesSummaryReport', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'getSalesSummaryReport', err))
    );
  }

  getFlightPerformanceReport(request: IReportRequestDto): Observable<IFlightPerformanceReportDto> {
    const url = `${this.baseUrl}/flight-performance`;
    const startStr = request.startDate instanceof Date ? request.startDate.toISOString() : request.startDate;
    const endStr = request.endDate instanceof Date ? request.endDate.toISOString() : request.endDate;
    let params = new HttpParams().set('startDate', startStr).set('endDate', endStr);
    
    if (request.airlineIataCode) params = params.set('airlineIataCode', request.airlineIataCode);
    if (request.airportIataCode) params = params.set('airportIataCode', request.airportIataCode);

    logApiRequest(this.SERVICE_NAME, 'getFlightPerformanceReport', url, request);
    return this.http.get<IApiResponse<IFlightPerformanceReportDto>>(url, { params }).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'getFlightPerformanceReport', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'getFlightPerformanceReport', err))
    );
  }

  getLoadFactorReport(request: IReportRequestDto): Observable<ILoadFactorReportDto> {
    const url = `${this.baseUrl}/load-factor`;
    const startStr = request.startDate instanceof Date ? request.startDate.toISOString() : request.startDate;
    const endStr = request.endDate instanceof Date ? request.endDate.toISOString() : request.endDate;
    let params = new HttpParams().set('startDate', startStr).set('endDate', endStr);
    
    if (request.airlineIataCode) params = params.set('airlineIataCode', request.airlineIataCode);
    if (request.airportIataCode) params = params.set('airportIataCode', request.airportIataCode);

    logApiRequest(this.SERVICE_NAME, 'getLoadFactorReport', url, request);
    return this.http.get<IApiResponse<ILoadFactorReportDto>>(url, { params }).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'getLoadFactorReport', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'getLoadFactorReport', err))
    );
  }

  getPassengerManifest(flightInstanceId: number): Observable<IPassengerManifestDto> {
    const url = `${this.baseUrl}/passenger-manifest/${flightInstanceId}`;
    logApiRequest(this.SERVICE_NAME, 'getPassengerManifest', url);
    return this.http.get<IApiResponse<IPassengerManifestDto>>(url).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'getPassengerManifest', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'getPassengerManifest', err))
    );
  }

  getDailyDepartureManifests(airportIataCode: string, forDate: string | Date): Observable<IPassengerManifestDto[]> {
    const url = `${this.baseUrl}/daily-departure-manifests`;
    const dateStr = forDate instanceof Date ? forDate.toISOString() : forDate;
    const params = new HttpParams()
      .set('airportIataCode', airportIataCode)
      .set('forDate', dateStr);

    logApiRequest(this.SERVICE_NAME, 'getDailyDepartureManifests', url, { airportIataCode, forDate });
    return this.http.get<IApiResponse<IPassengerManifestDto[]>>(url, { params }).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'getDailyDepartureManifests', res); return res?.data || []; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'getDailyDepartureManifests', err))
    );
  }
}
