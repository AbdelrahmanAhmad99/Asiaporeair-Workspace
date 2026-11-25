import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

import { IApiResponse } from '../../models/api-response.model';
import { IPaginatedResult } from '../../models/paging.model';
import { logApiRequest, logApiResponse, handleApiError } from '../api-helpers';

import { 
  IPriceOfferLogFilterDto, IPriceOfferLogDto, IPriceAnalyticsDto, ICreatePriceOfferLogDto 
} from '../../models/price-log.model';

@Injectable({
  providedIn: 'root'
})
export class PriceLogService {
  private http = inject(HttpClient);
  private readonly SERVICE_NAME = 'PriceLogService';
  private readonly baseUrl = `${environment.apiUrl}/v1/admin/pricelogs`;

  searchLogs(filter: IPriceOfferLogFilterDto, pageNumber: number = 1, pageSize: number = 20): Observable<IPaginatedResult<IPriceOfferLogDto>> {
    const url = `${this.baseUrl}/search`;
    let params = new HttpParams().set('pageNumber', pageNumber.toString()).set('pageSize', pageSize.toString());
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (value instanceof Date) {
          params = params.set(key, value.toISOString());
        } else {
          params = params.set(key, value.toString());
        }
      }
    });

    logApiRequest(this.SERVICE_NAME, 'searchLogs', url, { filter, pageNumber, pageSize });
    return this.http.get<IApiResponse<IPaginatedResult<IPriceOfferLogDto>>>(url, { params }).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'searchLogs', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'searchLogs', err))
    );
  }

  getLogById(offerId: number): Observable<IPriceOfferLogDto> {
    const url = `${this.baseUrl}/${offerId}`;
    logApiRequest(this.SERVICE_NAME, 'getLogById', url);
    return this.http.get<IApiResponse<IPriceOfferLogDto>>(url).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'getLogById', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'getLogById', err))
    );
  }

  getAnalyticsForFare(fareCode: string, startDate: string | Date, endDate: string | Date): Observable<IPriceAnalyticsDto> {
    const url = `${this.baseUrl}/analytics/fare`;
    const startStr = startDate instanceof Date ? startDate.toISOString() : startDate;
    const endStr = endDate instanceof Date ? endDate.toISOString() : endDate;
    const params = new HttpParams()
      .set('fareCode', fareCode)
      .set('startDate', startStr)
      .set('endDate', endStr);

    logApiRequest(this.SERVICE_NAME, 'getAnalyticsForFare', url, { fareCode, startDate, endDate });
    return this.http.get<IApiResponse<IPriceAnalyticsDto>>(url, { params }).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'getAnalyticsForFare', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'getAnalyticsForFare', err))
    );
  }

  getAnalyticsForAncillary(ancillaryProductId: number, startDate: string | Date, endDate: string | Date): Observable<IPriceAnalyticsDto> {
    const url = `${this.baseUrl}/analytics/ancillary`;
    const startStr = startDate instanceof Date ? startDate.toISOString() : startDate;
    const endStr = endDate instanceof Date ? endDate.toISOString() : endDate;
    const params = new HttpParams()
      .set('ancillaryProductId', ancillaryProductId.toString())
      .set('startDate', startStr)
      .set('endDate', endStr);

    logApiRequest(this.SERVICE_NAME, 'getAnalyticsForAncillary', url, { ancillaryProductId, startDate, endDate });
    return this.http.get<IApiResponse<IPriceAnalyticsDto>>(url, { params }).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'getAnalyticsForAncillary', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'getAnalyticsForAncillary', err))
    );
  }

  logPriceOffer(dto: ICreatePriceOfferLogDto): Observable<IPriceOfferLogDto> {
    const url = `${this.baseUrl}`;
    logApiRequest(this.SERVICE_NAME, 'logPriceOffer', url, dto);
    return this.http.post<IApiResponse<IPriceOfferLogDto>>(url, dto).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'logPriceOffer', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'logPriceOffer', err))
    );
  }

  deleteLog(offerId: number): Observable<void> {
    const url = `${this.baseUrl}/${offerId}`;
    logApiRequest(this.SERVICE_NAME, 'deleteLog', url);
    return this.http.delete<IApiResponse<void>>(url).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'deleteLog', res); }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'deleteLog', err))
    );
  }

  reactivateLog(offerId: number): Observable<void> {
    const url = `${this.baseUrl}/${offerId}/reactivate`;
    logApiRequest(this.SERVICE_NAME, 'reactivateLog', url);
    return this.http.post<IApiResponse<void>>(url, {}).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'reactivateLog', res); }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'reactivateLog', err))
    );
  }
}
