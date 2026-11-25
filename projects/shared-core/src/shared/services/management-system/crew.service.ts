import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

import { IApiResponse } from '../../models/api-response.model';
import { IPaginatedResult } from '../../models/paging.model';
import { logApiRequest, logApiResponse, handleApiError } from '../api-helpers';

import { 
  ICrewFilterDto, IUpdateCrewBaseRequestDto, ICrewMemberDetailDto, ICrewMemberSummaryDto,
  ICertificationDto, ICreateCertificationDto, IAssignCrewRequestDto, ICrewScheduleRequestDto,
  ICrewAvailabilityRequestDto
} from '../../models/crew.model';

@Injectable({
  providedIn: 'root'
})
export class CrewService {
  private http = inject(HttpClient);
  private readonly SERVICE_NAME = 'CrewService';
  private readonly baseUrl = `${environment.apiUrl}/v1/admin/crew`;

  getCrewMembersPaginated(filter: ICrewFilterDto, pageNumber: number = 1, pageSize: number = 10): Observable<IPaginatedResult<ICrewMemberSummaryDto>> {
    const url = `${this.baseUrl}/search`;
    let params = new HttpParams().set('pageNumber', pageNumber.toString()).set('pageSize', pageSize.toString());
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params = params.set(key, value.toString());
      }
    });

    logApiRequest(this.SERVICE_NAME, 'getCrewMembersPaginated', url, { filter, pageNumber, pageSize });
    return this.http.get<IApiResponse<IPaginatedResult<ICrewMemberSummaryDto>>>(url, { params }).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'getCrewMembersPaginated', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'getCrewMembersPaginated', err))
    );
  }

  getCrewMemberDetailsById(employeeId: number): Observable<ICrewMemberDetailDto> {
    const url = `${this.baseUrl}/${employeeId}/details`;
    logApiRequest(this.SERVICE_NAME, 'getCrewMemberDetailsById', url);
    return this.http.get<IApiResponse<ICrewMemberDetailDto>>(url).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'getCrewMemberDetailsById', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'getCrewMemberDetailsById', err))
    );
  }

  updateCrewBase(employeeId: number, dto: IUpdateCrewBaseRequestDto): Observable<ICrewMemberSummaryDto> {
    const url = `${this.baseUrl}/${employeeId}/base`;
    logApiRequest(this.SERVICE_NAME, 'updateCrewBase', url, dto);
    return this.http.put<IApiResponse<ICrewMemberSummaryDto>>(url, dto).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'updateCrewBase', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'updateCrewBase', err))
    );
  }

  getCertificationsForCrewMember(employeeId: number): Observable<ICertificationDto[]> {
    const url = `${this.baseUrl}/${employeeId}/certifications`;
    logApiRequest(this.SERVICE_NAME, 'getCertificationsForCrewMember', url);
    return this.http.get<IApiResponse<ICertificationDto[]>>(url).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'getCertificationsForCrewMember', res); return res?.data || []; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'getCertificationsForCrewMember', err))
    );
  }

  addCertification(employeeId: number, dto: ICreateCertificationDto): Observable<ICertificationDto> {
    const url = `${this.baseUrl}/${employeeId}/certifications`;
    logApiRequest(this.SERVICE_NAME, 'addCertification', url, dto);
    return this.http.post<IApiResponse<ICertificationDto>>(url, dto).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'addCertification', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'addCertification', err))
    );
  }

  updateCertification(certId: number, dto: ICreateCertificationDto): Observable<ICertificationDto> {
    const url = `${this.baseUrl}/certifications/${certId}`;
    logApiRequest(this.SERVICE_NAME, 'updateCertification', url, dto);
    return this.http.put<IApiResponse<ICertificationDto>>(url, dto).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'updateCertification', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'updateCertification', err))
    );
  }

  deleteCertification(certId: number): Observable<void> {
    const url = `${this.baseUrl}/certifications/${certId}`;
    logApiRequest(this.SERVICE_NAME, 'deleteCertification', url);
    return this.http.delete<IApiResponse<void>>(url).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'deleteCertification', res); }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'deleteCertification', err))
    );
  }

  assignCrewToFlight(request: IAssignCrewRequestDto): Observable<void> {
    const url = `${this.baseUrl}/assignments`;
    logApiRequest(this.SERVICE_NAME, 'assignCrewToFlight', url, request);
    return this.http.post<IApiResponse<void>>(url, request).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'assignCrewToFlight', res); }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'assignCrewToFlight', err))
    );
  }

  removeCrewFromFlight(flightInstanceId: number, crewMemberId: number): Observable<void> {
    const url = `${this.baseUrl}/assignments/${flightInstanceId}/${crewMemberId}`;
    logApiRequest(this.SERVICE_NAME, 'removeCrewFromFlight', url);
    return this.http.delete<IApiResponse<void>>(url).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'removeCrewFromFlight', res); }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'removeCrewFromFlight', err))
    );
  }

  getFlightRoster(flightInstanceId: number): Observable<any[]> {
    const url = `${this.baseUrl}/roster/${flightInstanceId}`;
    logApiRequest(this.SERVICE_NAME, 'getFlightRoster', url);
    return this.http.get<IApiResponse<any[]>>(url).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'getFlightRoster', res); return res?.data || []; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'getFlightRoster', err))
    );
  }

  getCrewMemberSchedule(request: ICrewScheduleRequestDto): Observable<any[]> {
    const url = `${this.baseUrl}/schedule`;
    let params = new HttpParams()
      .set('crewMemberEmployeeId', request.crewMemberEmployeeId.toString())
      .set('startDate', request.startDate)
      .set('endDate', request.endDate);
      
    logApiRequest(this.SERVICE_NAME, 'getCrewMemberSchedule', url, request);
    return this.http.get<IApiResponse<any[]>>(url, { params }).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'getCrewMemberSchedule', res); return res?.data || []; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'getCrewMemberSchedule', err))
    );
  }

  findAvailableCrew(request: ICrewAvailabilityRequestDto): Observable<any[]> {
    const url = `${this.baseUrl}/find-available`;
    logApiRequest(this.SERVICE_NAME, 'findAvailableCrew', url, request);
    return this.http.post<IApiResponse<any[]>>(url, request).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'findAvailableCrew', res); return res?.data || []; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'findAvailableCrew', err))
    );
  }

  getCrewDashboardAnalytics(): Observable<any> {
    const url = `${this.baseUrl}/analytics`;
    logApiRequest(this.SERVICE_NAME, 'getCrewDashboardAnalytics', url);
    return this.http.get<IApiResponse<any>>(url).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'getCrewDashboardAnalytics', res); return res?.data; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'getCrewDashboardAnalytics', err))
    );
  }

  getCrewWithExpiringCertifications(daysUntilExpiry: number = 30): Observable<any[]> {
    const url = `${this.baseUrl}/reports/expiring-certifications`;
    const params = new HttpParams().set('daysUntilExpiry', daysUntilExpiry.toString());
    logApiRequest(this.SERVICE_NAME, 'getCrewWithExpiringCertifications', url, { daysUntilExpiry });
    return this.http.get<IApiResponse<any[]>>(url, { params }).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'getCrewWithExpiringCertifications', res); return res?.data || []; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'getCrewWithExpiringCertifications', err))
    );
  }
}
