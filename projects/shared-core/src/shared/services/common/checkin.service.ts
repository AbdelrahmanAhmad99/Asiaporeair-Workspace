import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

import { IApiResponse } from '../../../shared/models/api-response.model';
import { logApiRequest, logApiResponse, handleApiError } from '../api-helpers';

import {
  IBoardingPassDto,
  IGenerateBoardingPassRequest,
  IGateScanRequest,
  IBoardingPassFilter,
  IBoardingPassSearchResult,
  IGenerateBoardingPassByReferenceRequest
} from '../../models/check-in.model';

@Injectable({
  providedIn: 'root'
})
export class CheckInService {

  private http = inject(HttpClient);
  private readonly SERVICE_NAME = 'CheckInService';
  private readonly customerBaseUrl = `${environment.apiUrl}/v1/checkin`;
  private readonly adminBaseUrl = `${environment.apiUrl}/v1/checkin/admin`;

  constructor() { }

  generateBoardingPass(request: IGenerateBoardingPassRequest): Observable<IBoardingPassDto> {
    const url = `${this.customerBaseUrl}/generate`;
    logApiRequest(this.SERVICE_NAME, 'generateBoardingPass', url, request);

    return this.http.post<IApiResponse<IBoardingPassDto>>(url, request).pipe(
      map(response => {
        logApiResponse(this.SERVICE_NAME, 'generateBoardingPass', response);
        if (response && response.data) return response.data;
        throw new Error('Expected data payload is missing from the API response.');
      }),
      catchError(error => handleApiError(this.SERVICE_NAME, 'generateBoardingPass', error))
    );
  }

  generateBoardingPassByReference(request: IGenerateBoardingPassByReferenceRequest): Observable<IBoardingPassDto> {
    const url = `${this.customerBaseUrl}/generateByReference`;
    logApiRequest(this.SERVICE_NAME, 'generateBoardingPassByReference', url, request);

    return this.http.post<IApiResponse<IBoardingPassDto>>(url, request).pipe(
      map(response => {
        logApiResponse(this.SERVICE_NAME, 'generateBoardingPassByReference', response);
        if (response && response.data) return response.data;
        throw new Error('Expected data payload is missing from the API response.');
      }),
      catchError(error => handleApiError(this.SERVICE_NAME, 'generateBoardingPassByReference', error))
    );
  }

  getBoardingPassForPassenger(bookingId: number, passengerId: number): Observable<IBoardingPassDto> {
    const url = `${this.customerBaseUrl}/booking/${bookingId}/passenger/${passengerId}`;
    logApiRequest(this.SERVICE_NAME, 'getBoardingPassForPassenger', url, { bookingId, passengerId });

    return this.http.get<IApiResponse<IBoardingPassDto>>(url).pipe(
      map(response => {
        logApiResponse(this.SERVICE_NAME, 'getBoardingPassForPassenger', response);
        if (response && response.data) return response.data;
        throw new Error('Expected data payload is missing from the API response.');
      }),
      catchError(error => handleApiError(this.SERVICE_NAME, 'getBoardingPassForPassenger', error))
    );
  }

  scanBoardingPassAtGate(request: IGateScanRequest): Observable<void> {
    const url = `${this.adminBaseUrl}/gate-scan`;
    logApiRequest(this.SERVICE_NAME, 'scanBoardingPassAtGate', url, request);

    return this.http.post<IApiResponse<null>>(url, request).pipe(
      map(response => {
        logApiResponse(this.SERVICE_NAME, 'scanBoardingPassAtGate', response);
        return undefined;
      }),
      catchError(error => handleApiError(this.SERVICE_NAME, 'scanBoardingPassAtGate', error))
    );
  }

  getFlightManifest(flightInstanceId: number): Observable<IBoardingPassDto[]> {
    const url = `${this.adminBaseUrl}/flight-manifest/${flightInstanceId}`;
    logApiRequest(this.SERVICE_NAME, 'getFlightManifest', url, { flightInstanceId });

    return this.http.get<IApiResponse<IBoardingPassDto[]>>(url).pipe(
      map(response => {
        logApiResponse(this.SERVICE_NAME, 'getFlightManifest', response);
        if (response && response.data) return response.data;
        throw new Error('Expected data payload is missing from the API response.');
      }),
      catchError(error => handleApiError(this.SERVICE_NAME, 'getFlightManifest', error))
    );
  }

  searchBoardingPasses(
    filter: IBoardingPassFilter,
    pageNumber: number = 1,
    pageSize: number = 10
  ): Observable<IBoardingPassSearchResult> {
    const url = `${this.adminBaseUrl}/search`;
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString())
      .set('includeDeleted', filter.includeDeleted ? 'true' : 'false');

    if (filter.flightInstanceId) params = params.set('flightInstanceId', filter.flightInstanceId.toString());
    if (filter.seatNumber) params = params.set('seatNumber', filter.seatNumber);
    if (filter.passengerNameContains) params = params.set('passengerNameContains', filter.passengerNameContains);
    if (filter.hasBoarded !== null && filter.hasBoarded !== undefined) {
      params = params.set('hasBoarded', filter.hasBoarded.toString());
    }

    logApiRequest(this.SERVICE_NAME, 'searchBoardingPasses', url, { filter, pageNumber, pageSize });

    return this.http.get<IApiResponse<IBoardingPassSearchResult>>(url, { params }).pipe(
      map(response => {
        logApiResponse(this.SERVICE_NAME, 'searchBoardingPasses', response);
        if (response && response.data) return response.data;
        throw new Error('Expected data payload is missing from the API response.');
      }),
      catchError(error => handleApiError(this.SERVICE_NAME, 'searchBoardingPasses', error))
    );
  }

  getBoardingPassById(passId: number): Observable<IBoardingPassDto> {
    const url = `${this.adminBaseUrl}/pass/${passId}`;
    logApiRequest(this.SERVICE_NAME, 'getBoardingPassById', url, { passId });

    return this.http.get<IApiResponse<IBoardingPassDto>>(url).pipe(
      map(response => {
        logApiResponse(this.SERVICE_NAME, 'getBoardingPassById', response);
        if (response && response.data) return response.data;
        throw new Error('Expected data payload is missing from the API response.');
      }),
      catchError(error => handleApiError(this.SERVICE_NAME, 'getBoardingPassById', error))
    );
  }

  voidBoardingPass(passId: number): Observable<void> {
    const url = `${this.adminBaseUrl}/void/${passId}`;
    logApiRequest(this.SERVICE_NAME, 'voidBoardingPass', url, { passId });

    return this.http.delete<IApiResponse<null>>(url).pipe(
      map(response => {
        logApiResponse(this.SERVICE_NAME, 'voidBoardingPass', response);
        return undefined;
      }),
      catchError(error => handleApiError(this.SERVICE_NAME, 'voidBoardingPass', error))
    );
  }
}