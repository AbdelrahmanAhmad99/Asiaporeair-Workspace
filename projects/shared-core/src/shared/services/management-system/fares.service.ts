import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

import { IApiResponse } from '../../models/api-response.model';
import { IPaginatedResult } from '../../models/paging.model';
import { logApiRequest, logApiResponse, handleApiError } from '../api-helpers';

import { 
  IFareBasisCodeDto, ICreateFareBasisCodeDto, IUpdateFareBasisCodeDto
} from '../../models/fares.model';

@Injectable({
  providedIn: 'root'
})
export class FaresService {
  private http = inject(HttpClient);
  private readonly SERVICE_NAME = 'FaresService';
  private readonly baseUrl = `${environment.apiUrl}/v1/admin/fares`;

  getAllActiveFares(): Observable<IFareBasisCodeDto[]> {
    const url = `${this.baseUrl}`;
    logApiRequest(this.SERVICE_NAME, 'getAllActiveFares', url);
    return this.http.get<IApiResponse<IFareBasisCodeDto[]>>(url).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'getAllActiveFares', res); return res?.data || []; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'getAllActiveFares', err))
    );
  }

  searchFares(pageNumber: number = 1, pageSize: number = 10, description?: string): Observable<IPaginatedResult<IFareBasisCodeDto>> {
    const url = `${this.baseUrl}/search`;
    let params = new HttpParams().set('pageNumber', pageNumber.toString()).set('pageSize', pageSize.toString());
    if (description) params = params.set('description', description);

    logApiRequest(this.SERVICE_NAME, 'searchFares', url, { pageNumber, pageSize, description });
    return this.http.get<IApiResponse<IPaginatedResult<IFareBasisCodeDto>>>(url, { params }).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'searchFares', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'searchFares', err))
    );
  }

  getFareByCode(code: string): Observable<IFareBasisCodeDto> {
    const url = `${this.baseUrl}/${code}`;
    logApiRequest(this.SERVICE_NAME, 'getFareByCode', url);
    return this.http.get<IApiResponse<IFareBasisCodeDto>>(url).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'getFareByCode', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'getFareByCode', err))
    );
  }

  getAllFaresIncludingDeleted(): Observable<IFareBasisCodeDto[]> {
    const url = `${this.baseUrl}/all-including-deleted`;
    logApiRequest(this.SERVICE_NAME, 'getAllFaresIncludingDeleted', url);
    return this.http.get<IApiResponse<IFareBasisCodeDto[]>>(url).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'getAllFaresIncludingDeleted', res); return res?.data || []; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'getAllFaresIncludingDeleted', err))
    );
  }

  createFareCode(dto: ICreateFareBasisCodeDto): Observable<IFareBasisCodeDto> {
    const url = `${this.baseUrl}`;
    logApiRequest(this.SERVICE_NAME, 'createFareCode', url, dto);
    return this.http.post<IApiResponse<IFareBasisCodeDto>>(url, dto).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'createFareCode', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'createFareCode', err))
    );
  }

  updateFareCode(code: string, dto: IUpdateFareBasisCodeDto): Observable<IFareBasisCodeDto> {
    const url = `${this.baseUrl}/${code}`;
    logApiRequest(this.SERVICE_NAME, 'updateFareCode', url, dto);
    return this.http.put<IApiResponse<IFareBasisCodeDto>>(url, dto).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'updateFareCode', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'updateFareCode', err))
    );
  }

  deleteFareCode(code: string): Observable<void> {
    const url = `${this.baseUrl}/${code}`;
    logApiRequest(this.SERVICE_NAME, 'deleteFareCode', url);
    return this.http.delete<IApiResponse<void>>(url).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'deleteFareCode', res); }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'deleteFareCode', err))
    );
  }

  reactivateFareCode(code: string): Observable<void> {
    const url = `${this.baseUrl}/${code}/reactivate`;
    logApiRequest(this.SERVICE_NAME, 'reactivateFareCode', url);
    return this.http.post<IApiResponse<void>>(url, {}).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'reactivateFareCode', res); }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'reactivateFareCode', err))
    );
  }
}
