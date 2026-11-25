import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

import { IApiResponse } from '../../../shared/models/api-response.model';
import { logApiRequest, logApiResponse, handleApiError } from '../api-helpers';

import {
  IFrequentFlyerDto,
  ICreateFrequentFlyerRequest,
  IFrequentFlyerFilter,
  IFrequentFlyerSearchResult,
  IUpdatePointsRequest,
  IUpdateLevelRequest,
  IPointsAddedResponse
} from '../../models/frequent-flyer.model';

@Injectable({
  providedIn: 'root'
})
export class FrequentFlyerService {

  private http = inject(HttpClient);
  private readonly SERVICE_NAME = 'FrequentFlyerService';
  private readonly customerBaseUrl = `${environment.apiUrl}/v1/frequentflyer`;
  private readonly adminBaseUrl = `${environment.apiUrl}/v1/frequentflyer/admin`;

  constructor() { }

  getMyAccount(): Observable<IFrequentFlyerDto> {
    const url = `${this.customerBaseUrl}/my-account`;
    logApiRequest(this.SERVICE_NAME, 'getMyAccount', url);

    return this.http.get<IApiResponse<IFrequentFlyerDto>>(url).pipe(
      map(response => {
        logApiResponse(this.SERVICE_NAME, 'getMyAccount', response);
        if (response && response.data) return response.data;
        throw new Error('API executed successfully but returned no data payload.');
      }),
      catchError(error => handleApiError(this.SERVICE_NAME, 'getMyAccount', error))
    );
  }

  searchAccounts(
    filter: IFrequentFlyerFilter,
    pageNumber: number = 1,
    pageSize: number = 10
  ): Observable<IFrequentFlyerSearchResult> {
    const url = `${this.adminBaseUrl}/search`;
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString())
      .set('includeDeleted', filter.includeDeleted ? 'true' : 'false');

    if (filter.cardNumberContains) params = params.set('cardNumberContains', filter.cardNumberContains);
    if (filter.level) params = params.set('level', filter.level);
    if (filter.minPoints != null) params = params.set('minPoints', filter.minPoints.toString());
    if (filter.maxPoints != null) params = params.set('maxPoints', filter.maxPoints.toString());

    logApiRequest(this.SERVICE_NAME, 'searchAccounts', url, { filter, pageNumber, pageSize });

    return this.http.get<IApiResponse<IFrequentFlyerSearchResult>>(url, { params }).pipe(
      map(response => {
        logApiResponse(this.SERVICE_NAME, 'searchAccounts', response);
        if (response && response.data) return response.data;
        throw new Error('API executed successfully but returned no data payload.');
      }),
      catchError(error => handleApiError(this.SERVICE_NAME, 'searchAccounts', error))
    );
  }

  getAccountByUserId(userId: number): Observable<IFrequentFlyerDto> {
    const url = `${this.adminBaseUrl}/user/${userId}`;
    logApiRequest(this.SERVICE_NAME, 'getAccountByUserId', url, { userId });

    return this.http.get<IApiResponse<IFrequentFlyerDto>>(url).pipe(
      map(response => {
        logApiResponse(this.SERVICE_NAME, 'getAccountByUserId', response);
        if (response && response.data) return response.data;
        throw new Error('API executed successfully but returned no data payload.');
      }),
      catchError(error => handleApiError(this.SERVICE_NAME, 'getAccountByUserId', error))
    );
  }

  getAccountByCardNumber(cardNumber: string): Observable<IFrequentFlyerDto> {
    const url = `${this.adminBaseUrl}/card/${cardNumber}`;
    logApiRequest(this.SERVICE_NAME, 'getAccountByCardNumber', url, { cardNumber });

    return this.http.get<IApiResponse<IFrequentFlyerDto>>(url).pipe(
      map(response => {
        logApiResponse(this.SERVICE_NAME, 'getAccountByCardNumber', response);
        if (response && response.data) return response.data;
        throw new Error('API executed successfully but returned no data payload.');
      }),
      catchError(error => handleApiError(this.SERVICE_NAME, 'getAccountByCardNumber', error))
    );
  }

  createAccount(request: ICreateFrequentFlyerRequest): Observable<IFrequentFlyerDto> {
    const url = `${this.adminBaseUrl}/create`;
    logApiRequest(this.SERVICE_NAME, 'createAccount', url, request);

    return this.http.post<IApiResponse<IFrequentFlyerDto>>(url, request).pipe(
      map(response => {
        logApiResponse(this.SERVICE_NAME, 'createAccount', response);
        if (response && response.data) return response.data;
        throw new Error('API executed successfully but returned no data payload.');
      }),
      catchError(error => handleApiError(this.SERVICE_NAME, 'createAccount', error))
    );
  }

  manualAdjustPoints(flyerId: number, request: IUpdatePointsRequest): Observable<IFrequentFlyerDto> {
    const url = `${this.adminBaseUrl}/points/${flyerId}`;
    logApiRequest(this.SERVICE_NAME, 'manualAdjustPoints', url, request);

    return this.http.put<IApiResponse<IFrequentFlyerDto>>(url, request).pipe(
      map(response => {
        logApiResponse(this.SERVICE_NAME, 'manualAdjustPoints', response);
        if (response && response.data) return response.data;
        throw new Error('API executed successfully but returned no data payload.');
      }),
      catchError(error => handleApiError(this.SERVICE_NAME, 'manualAdjustPoints', error))
    );
  }

  updateLevel(flyerId: number, request: IUpdateLevelRequest): Observable<IFrequentFlyerDto> {
    const url = `${this.adminBaseUrl}/level/${flyerId}`;
    logApiRequest(this.SERVICE_NAME, 'updateLevel', url, request);

    return this.http.put<IApiResponse<IFrequentFlyerDto>>(url, request).pipe(
      map(response => {
        logApiResponse(this.SERVICE_NAME, 'updateLevel', response);
        if (response && response.data) return response.data;
        throw new Error('API executed successfully but returned no data payload.');
      }),
      catchError(error => handleApiError(this.SERVICE_NAME, 'updateLevel', error))
    );
  }

  addPointsForBooking(bookingId: number): Observable<IPointsAddedResponse> {
    const url = `${this.adminBaseUrl}/add-points/booking/${bookingId}`;
    logApiRequest(this.SERVICE_NAME, 'addPointsForBooking', url, { bookingId });

    return this.http.post<IApiResponse<IPointsAddedResponse>>(url, {}).pipe(
      map(response => {
        logApiResponse(this.SERVICE_NAME, 'addPointsForBooking', response);
        if (response && response.data) return response.data;
        throw new Error('API executed successfully but returned no data payload.');
      }),
      catchError(error => handleApiError(this.SERVICE_NAME, 'addPointsForBooking', error))
    );
  }

  deleteAccount(flyerId: number): Observable<void> {
    const url = `${this.adminBaseUrl}/delete/${flyerId}`;
    logApiRequest(this.SERVICE_NAME, 'deleteAccount', url, { flyerId });

    return this.http.delete<IApiResponse<null>>(url).pipe(
      map(response => {
        logApiResponse(this.SERVICE_NAME, 'deleteAccount', response);
        return undefined;
      }),
      catchError(error => handleApiError(this.SERVICE_NAME, 'deleteAccount', error))
    );
  }
}