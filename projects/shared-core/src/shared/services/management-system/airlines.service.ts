import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

import { IApiResponse } from '../../models/api-response.model';
import { IPaginatedResult } from '../../models/paging.model';
import { logApiRequest, logApiResponse, handleApiError } from '../api-helpers';
import {
  IAirlineDto, IAirlineDetailDto, ICreateAirlineDto, IUpdateAirlineDto
} from '../../models/airline.model';

@Injectable({
  providedIn: 'root'
})
export class AirlinesService {
  private http = inject(HttpClient);
  private readonly SERVICE_NAME = 'AirlinesService';
  private readonly baseUrl = `${environment.apiUrl}/v1/admin/airlines`;

  getAllActiveAirlines(): Observable<IAirlineDto[]> {
    const url = `${this.baseUrl}`;
    logApiRequest(this.SERVICE_NAME, 'getAllActiveAirlines', url);
    return this.http.get<IApiResponse<IAirlineDto[]>>(url).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'getAllActiveAirlines', res); return res?.data || []; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'getAllActiveAirlines', err))
    );
  }

  getPaginatedAirlines(pageNumber: number = 1, pageSize: number = 10, region?: string): Observable<IPaginatedResult<IAirlineDto>> {
    const url = `${this.baseUrl}/paginated`;
    let params = new HttpParams().set('pageNumber', pageNumber.toString()).set('pageSize', pageSize.toString());
    if (region) params = params.set('region', region);

    logApiRequest(this.SERVICE_NAME, 'getPaginatedAirlines', url, { pageNumber, pageSize, region });
    return this.http.get<IApiResponse<IPaginatedResult<IAirlineDto>>>(url, { params }).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'getPaginatedAirlines', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'getPaginatedAirlines', err))
    );
  }

  getAirlineByIataCode(iataCode: string): Observable<IAirlineDto> {
    const url = `${this.baseUrl}/${iataCode}`;
    logApiRequest(this.SERVICE_NAME, 'getAirlineByIataCode', url);
    return this.http.get<IApiResponse<IAirlineDto>>(url).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'getAirlineByIataCode', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'getAirlineByIataCode', err))
    );
  }

  getAirlineWithFleet(iataCode: string): Observable<IAirlineDetailDto> {
    const url = `${this.baseUrl}/${iataCode}/fleet`;
    logApiRequest(this.SERVICE_NAME, 'getAirlineWithFleet', url);
    return this.http.get<IApiResponse<IAirlineDetailDto>>(url).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'getAirlineWithFleet', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'getAirlineWithFleet', err))
    );
  }

  findAirlinesByName(name: string): Observable<IAirlineDto[]> {
    const url = `${this.baseUrl}/by-name`;
    const params = new HttpParams().set('name', name);
    logApiRequest(this.SERVICE_NAME, 'findAirlinesByName', url, { name });
    return this.http.get<IApiResponse<IAirlineDto[]>>(url, { params }).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'findAirlinesByName', res); return res?.data || []; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'findAirlinesByName', err))
    );
  }

  getAirlinesByBaseAirport(airportIataCode: string): Observable<IAirlineDto[]> {
    const url = `${this.baseUrl}/by-base-airport/${airportIataCode}`;
    logApiRequest(this.SERVICE_NAME, 'getAirlinesByBaseAirport', url);
    return this.http.get<IApiResponse<IAirlineDto[]>>(url).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'getAirlinesByBaseAirport', res); return res?.data || []; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'getAirlinesByBaseAirport', err))
    );
  }

  getAirlinesByOperatingRegion(region: string): Observable<IAirlineDto[]> {
    const url = `${this.baseUrl}/by-region`;
    const params = new HttpParams().set('region', region);
    logApiRequest(this.SERVICE_NAME, 'getAirlinesByOperatingRegion', url, { region });
    return this.http.get<IApiResponse<IAirlineDto[]>>(url, { params }).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'getAirlinesByOperatingRegion', res); return res?.data || []; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'getAirlinesByOperatingRegion', err))
    );
  }

  getAllAirlinesIncludingDeleted(): Observable<IAirlineDto[]> {
    const url = `${this.baseUrl}/all-including-deleted`;
    logApiRequest(this.SERVICE_NAME, 'getAllAirlinesIncludingDeleted', url);
    return this.http.get<IApiResponse<IAirlineDto[]>>(url).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'getAllAirlinesIncludingDeleted', res); return res?.data || []; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'getAllAirlinesIncludingDeleted', err))
    );
  }

  createAirline(dto: ICreateAirlineDto): Observable<IAirlineDto> {
    const url = `${this.baseUrl}`;
    logApiRequest(this.SERVICE_NAME, 'createAirline', url, dto);
    return this.http.post<IApiResponse<IAirlineDto>>(url, dto).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'createAirline', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'createAirline', err))
    );
  }

  updateAirline(iataCode: string, dto: IUpdateAirlineDto): Observable<IAirlineDto> {
    const url = `${this.baseUrl}/${iataCode}`;
    logApiRequest(this.SERVICE_NAME, 'updateAirline', url, dto);
    return this.http.put<IApiResponse<IAirlineDto>>(url, dto).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'updateAirline', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'updateAirline', err))
    );
  }

  deleteAirline(iataCode: string): Observable<void> {
    const url = `${this.baseUrl}/${iataCode}`;
    logApiRequest(this.SERVICE_NAME, 'deleteAirline', url);
    return this.http.delete<IApiResponse<void>>(url).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'deleteAirline', res); }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'deleteAirline', err))
    );
  }

  reactivateAirline(iataCode: string): Observable<void> {
    const url = `${this.baseUrl}/${iataCode}/reactivate`;
    logApiRequest(this.SERVICE_NAME, 'reactivateAirline', url);
    return this.http.post<IApiResponse<void>>(url, {}).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'reactivateAirline', res); }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'reactivateAirline', err))
    );
  }
}
