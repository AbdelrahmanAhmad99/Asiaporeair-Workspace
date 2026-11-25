import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

import { IApiResponse } from '../../models/api-response.model';
import { IPaginatedResult } from '../../models/paging.model';
import { logApiRequest, logApiResponse, handleApiError } from '../api-helpers';

import {
  IFlightInstanceFilterDto, IFlightInstanceDto, IFlightInstanceBriefDto,
  IGenerateInstancesRequestDto, IGenerationReportDto, ICreateAdHocFlightInstanceDto,
  IUpdateFlightStatusDto, IUpdateFlightTimesDto, IAssignAircraftDto, IUpdateGateInfoDto
} from '../../models/flight-operations.model';

@Injectable({
  providedIn: 'root'
})
export class FlightOperationsService {
  private http = inject(HttpClient);
  private readonly SERVICE_NAME = 'FlightOperationsService';
  private readonly baseUrl = `${environment.apiUrl}/v1/admin/operations`;

  searchFlightInstances(filter: IFlightInstanceFilterDto, pageNumber: number = 1, pageSize: number = 10): Observable<IPaginatedResult<IFlightInstanceDto>> {
    const url = `${this.baseUrl}/search`;
    let params = new HttpParams().set('pageNumber', pageNumber.toString()).set('pageSize', pageSize.toString());
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params = params.set(key, value.toString());
      }
    });

    logApiRequest(this.SERVICE_NAME, 'searchFlightInstances', url, { filter, pageNumber, pageSize });
    return this.http.get<IApiResponse<IPaginatedResult<IFlightInstanceDto>>>(url, { params }).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'searchFlightInstances', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'searchFlightInstances', err))
    );
  }

  getInstanceById(instanceId: number): Observable<IFlightInstanceDto> {
    const url = `${this.baseUrl}/${instanceId}`;
    logApiRequest(this.SERVICE_NAME, 'getInstanceById', url);
    return this.http.get<IApiResponse<IFlightInstanceDto>>(url).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'getInstanceById', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'getInstanceById', err))
    );
  }

  getInstancesByDateRange(startDate: string | Date, endDate: string | Date, airportIataCode?: string): Observable<IFlightInstanceBriefDto[]> {
    const url = `${this.baseUrl}/by-date-range`;
    const startStr = startDate instanceof Date ? startDate.toISOString() : startDate;
    const endStr = endDate instanceof Date ? endDate.toISOString() : endDate;
    let params = new HttpParams().set('startDate', startStr).set('endDate', endStr);
    if (airportIataCode) params = params.set('airportIataCode', airportIataCode);

    logApiRequest(this.SERVICE_NAME, 'getInstancesByDateRange', url, { startDate, endDate, airportIataCode });
    return this.http.get<IApiResponse<IFlightInstanceBriefDto[]>>(url, { params }).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'getInstancesByDateRange', res); return res?.data || []; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'getInstancesByDateRange', err))
    );
  }

  getInstancesByAircraft(tailNumber: string, startDate: string | Date, endDate: string | Date): Observable<IFlightInstanceBriefDto[]> {
    const url = `${this.baseUrl}/by-aircraft/${tailNumber}`;
    const startStr = startDate instanceof Date ? startDate.toISOString() : startDate;
    const endStr = endDate instanceof Date ? endDate.toISOString() : endDate;
    let params = new HttpParams().set('startDate', startStr).set('endDate', endStr);

    logApiRequest(this.SERVICE_NAME, 'getInstancesByAircraft', url, { tailNumber, startDate, endDate });
    return this.http.get<IApiResponse<IFlightInstanceBriefDto[]>>(url, { params }).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'getInstancesByAircraft', res); return res?.data || []; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'getInstancesByAircraft', err))
    );
  }

  generateInstancesFromSchedules(request: IGenerateInstancesRequestDto): Observable<IGenerationReportDto> {
    const url = `${this.baseUrl}/generate-from-schedules`;
    logApiRequest(this.SERVICE_NAME, 'generateInstancesFromSchedules', url, request);
    return this.http.post<IApiResponse<IGenerationReportDto>>(url, request).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'generateInstancesFromSchedules', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'generateInstancesFromSchedules', err))
    );
  }

  createAdHocFlightInstance(createDto: ICreateAdHocFlightInstanceDto): Observable<IFlightInstanceDto> {
    const url = `${this.baseUrl}/ad-hoc`;
    logApiRequest(this.SERVICE_NAME, 'createAdHocFlightInstance', url, createDto);
    return this.http.post<IApiResponse<IFlightInstanceDto>>(url, createDto).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'createAdHocFlightInstance', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'createAdHocFlightInstance', err))
    );
  }

  updateFlightStatus(instanceId: number, updateDto: IUpdateFlightStatusDto): Observable<IFlightInstanceDto> {
    const url = `${this.baseUrl}/${instanceId}/status`;
    logApiRequest(this.SERVICE_NAME, 'updateFlightStatus', url, updateDto);
    return this.http.put<IApiResponse<IFlightInstanceDto>>(url, updateDto).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'updateFlightStatus', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'updateFlightStatus', err))
    );
  }

  updateFlightTimes(instanceId: number, updateDto: IUpdateFlightTimesDto): Observable<IFlightInstanceDto> {
    const url = `${this.baseUrl}/${instanceId}/times`;
    logApiRequest(this.SERVICE_NAME, 'updateFlightTimes', url, updateDto);
    return this.http.put<IApiResponse<IFlightInstanceDto>>(url, updateDto).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'updateFlightTimes', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'updateFlightTimes', err))
    );
  }

  assignAircraftToInstance(instanceId: number, assignDto: IAssignAircraftDto): Observable<void> {
    const url = `${this.baseUrl}/${instanceId}/assign-aircraft`;
    logApiRequest(this.SERVICE_NAME, 'assignAircraftToInstance', url, assignDto);
    return this.http.put<IApiResponse<void>>(url, assignDto).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'assignAircraftToInstance', res); }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'assignAircraftToInstance', err))
    );
  }

  deleteFlightInstance(instanceId: number, reason: string, notes?: string): Observable<void> {
    const url = `${this.baseUrl}/${instanceId}`;
    let params = new HttpParams().set('reason', reason);
    if (notes) params = params.set('notes', notes);

    logApiRequest(this.SERVICE_NAME, 'deleteFlightInstance', url, { reason, notes });
    return this.http.delete<IApiResponse<void>>(url, { params }).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'deleteFlightInstance', res); }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'deleteFlightInstance', err))
    );
  }
}
