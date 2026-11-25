import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

import { IApiResponse } from '../../models/api-response.model';
import { IPaginatedResult } from '../../models/paging.model';
import { logApiRequest, logApiResponse, handleApiError } from '../api-helpers';

import { 
  IEmployeeFilterDto, IEmployeeSummaryDto, IEmployeeAnalyticsDto, IUpdateSalaryRequestDto
} from '../../models/employee.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private http = inject(HttpClient);
  private readonly SERVICE_NAME = 'EmployeeService';
  private readonly baseUrl = `${environment.apiUrl}/v1/admin/employees`;

  getEmployeesPaginated(filter: IEmployeeFilterDto, pageNumber: number = 1, pageSize: number = 10): Observable<IPaginatedResult<IEmployeeSummaryDto>> {
    const url = `${this.baseUrl}/search`;
    let params = new HttpParams().set('pageNumber', pageNumber.toString()).set('pageSize', pageSize.toString());
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params = params.set(key, value.toString());
      }
    });

    logApiRequest(this.SERVICE_NAME, 'getEmployeesPaginated', url, { filter, pageNumber, pageSize });
    return this.http.get<IApiResponse<IPaginatedResult<IEmployeeSummaryDto>>>(url, { params }).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'getEmployeesPaginated', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'getEmployeesPaginated', err))
    );
  }

  getEmployeeDashboardAnalytics(): Observable<IEmployeeAnalyticsDto> {
    const url = `${this.baseUrl}/analytics`;
    logApiRequest(this.SERVICE_NAME, 'getEmployeeDashboardAnalytics', url);
    return this.http.get<IApiResponse<IEmployeeAnalyticsDto>>(url).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'getEmployeeDashboardAnalytics', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'getEmployeeDashboardAnalytics', err))
    );
  }

  getEmployeeSummaryById(employeeId: number): Observable<IEmployeeSummaryDto> {
    const url = `${this.baseUrl}/${employeeId}`;
    logApiRequest(this.SERVICE_NAME, 'getEmployeeSummaryById', url);
    return this.http.get<IApiResponse<IEmployeeSummaryDto>>(url).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'getEmployeeSummaryById', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'getEmployeeSummaryById', err))
    );
  }

  getEmployeeSummaryByAppUserId(appUserId: string): Observable<IEmployeeSummaryDto> {
    const url = `${this.baseUrl}/by-appuser/${appUserId}`;
    logApiRequest(this.SERVICE_NAME, 'getEmployeeSummaryByAppUserId', url);
    return this.http.get<IApiResponse<IEmployeeSummaryDto>>(url).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'getEmployeeSummaryByAppUserId', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'getEmployeeSummaryByAppUserId', err))
    );
  }

  getEmployeesByRole(role: string): Observable<IEmployeeSummaryDto[]> {
    const url = `${this.baseUrl}/by-role`;
    const params = new HttpParams().set('role', role);
    logApiRequest(this.SERVICE_NAME, 'getEmployeesByRole', url, { role });
    return this.http.get<IApiResponse<IEmployeeSummaryDto[]>>(url, { params }).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'getEmployeesByRole', res); return res?.data || []; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'getEmployeesByRole', err))
    );
  }

  getEmployeesHiredByDateRange(startDate: string | Date, endDate: string | Date): Observable<IEmployeeSummaryDto[]> {
    const url = `${this.baseUrl}/hiring-report`;
    const startStr = startDate instanceof Date ? startDate.toISOString() : startDate;
    const endStr = endDate instanceof Date ? endDate.toISOString() : endDate;
    const params = new HttpParams().set('startDate', startStr).set('endDate', endStr);

    logApiRequest(this.SERVICE_NAME, 'getEmployeesHiredByDateRange', url, { startDate, endDate });
    return this.http.get<IApiResponse<IEmployeeSummaryDto[]>>(url, { params }).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'getEmployeesHiredByDateRange', res); return res?.data || []; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'getEmployeesHiredByDateRange', err))
    );
  }

  updateEmployeeSalary(employeeId: number, dto: IUpdateSalaryRequestDto): Observable<IEmployeeSummaryDto> {
    const url = `${this.baseUrl}/${employeeId}/salary`;
    logApiRequest(this.SERVICE_NAME, 'updateEmployeeSalary', url, dto);
    return this.http.put<IApiResponse<IEmployeeSummaryDto>>(url, dto).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'updateEmployeeSalary', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'updateEmployeeSalary', err))
    );
  }

  deactivateEmployee(employeeId: number): Observable<void> {
    const url = `${this.baseUrl}/${employeeId}`;
    logApiRequest(this.SERVICE_NAME, 'deactivateEmployee', url);
    return this.http.delete<IApiResponse<void>>(url).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'deactivateEmployee', res); }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'deactivateEmployee', err))
    );
  }

  reactivateEmployee(employeeId: number): Observable<void> {
    const url = `${this.baseUrl}/${employeeId}/reactivate`;
    logApiRequest(this.SERVICE_NAME, 'reactivateEmployee', url);
    return this.http.post<IApiResponse<void>>(url, {}).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'reactivateEmployee', res); }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'reactivateEmployee', err))
    );
  }
}
