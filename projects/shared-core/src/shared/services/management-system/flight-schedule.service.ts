import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

import { IApiResponse } from '../../models/api-response.model';
import { IPaginatedResult } from '../../models/paging.model';
import { logApiRequest, logApiResponse, handleApiError } from '../api-helpers';

import {
  IScheduleFilterDto, IFlightScheduleDto, ICreateFlightScheduleDto,
  IFlightLegDefDto, ICreateFlightLegDefDto
} from '../../models/flight-schedule.model';

@Injectable({
  providedIn: 'root'
})
export class FlightScheduleService {
  private http = inject(HttpClient);
  private readonly SERVICE_NAME = 'FlightScheduleService';
  private readonly baseUrl = `${environment.apiUrl}/v1/admin/schedules`;

  searchSchedules(filter: IScheduleFilterDto, pageNumber: number = 1, pageSize: number = 10): Observable<IPaginatedResult<IFlightScheduleDto>> {
    const url = `${this.baseUrl}/search`;
    let params = new HttpParams().set('pageNumber', pageNumber.toString()).set('pageSize', pageSize.toString());
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params = params.set(key, value.toString());
      }
    });

    logApiRequest(this.SERVICE_NAME, 'searchSchedules', url, { filter, pageNumber, pageSize });
    return this.http.get<IApiResponse<IPaginatedResult<IFlightScheduleDto>>>(url, { params }).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'searchSchedules', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'searchSchedules', err))
    );
  }

  getScheduleById(scheduleId: number): Observable<IFlightScheduleDto> {
    const url = `${this.baseUrl}/${scheduleId}`;
    logApiRequest(this.SERVICE_NAME, 'getScheduleById', url);
    return this.http.get<IApiResponse<IFlightScheduleDto>>(url).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'getScheduleById', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'getScheduleById', err))
    );
  }

  createSchedule(dto: ICreateFlightScheduleDto): Observable<IFlightScheduleDto> {
    const url = `${this.baseUrl}`;
    logApiRequest(this.SERVICE_NAME, 'createSchedule', url, dto);
    return this.http.post<IApiResponse<IFlightScheduleDto>>(url, dto).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'createSchedule', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'createSchedule', err))
    );
  }

  updateSchedule(scheduleId: number, dto: ICreateFlightScheduleDto): Observable<IFlightScheduleDto> {
    const url = `${this.baseUrl}/${scheduleId}`;
    logApiRequest(this.SERVICE_NAME, 'updateSchedule', url, dto);
    return this.http.put<IApiResponse<IFlightScheduleDto>>(url, dto).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'updateSchedule', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'updateSchedule', err))
    );
  }

  deleteSchedule(scheduleId: number): Observable<void> {
    const url = `${this.baseUrl}/${scheduleId}`;
    logApiRequest(this.SERVICE_NAME, 'deleteSchedule', url);
    return this.http.delete<IApiResponse<void>>(url).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'deleteSchedule', res); }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'deleteSchedule', err))
    );
  }

  getLegsBySchedule(scheduleId: number): Observable<IFlightLegDefDto[]> {
    const url = `${this.baseUrl}/${scheduleId}/legs`;
    logApiRequest(this.SERVICE_NAME, 'getLegsBySchedule', url);
    return this.http.get<IApiResponse<IFlightLegDefDto[]>>(url).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'getLegsBySchedule', res); return res?.data || []; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'getLegsBySchedule', err))
    );
  }

  createFlightLeg(scheduleId: number, dto: ICreateFlightLegDefDto): Observable<IFlightLegDefDto> {
    const url = `${this.baseUrl}/${scheduleId}/legs`;
    logApiRequest(this.SERVICE_NAME, 'createFlightLeg', url, dto);
    return this.http.post<IApiResponse<IFlightLegDefDto>>(url, dto).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'createFlightLeg', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'createFlightLeg', err))
    );
  }
}
