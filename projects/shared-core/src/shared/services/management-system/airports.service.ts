import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

import { IApiResponse } from '../../models/api-response.model';
import { IPaginatedResult } from '../../models/paging.model';
import { logApiRequest, logApiResponse, handleApiError } from '../api-helpers';
import {
  IAirportDto, IAirportFilterDto, ICreateAirportDto, IUpdateAirportDto
} from '../../models/airport.model';

@Injectable({
  providedIn: 'root'
})
export class AirportsService {
  private http = inject(HttpClient);
  private readonly SERVICE_NAME = 'AirportsService';
  private readonly baseUrl = `${environment.apiUrl}/v1/admin/airports`;

  getAllActiveAirports(): Observable<IAirportDto[]> {
    const url = `${this.baseUrl}`;
    logApiRequest(this.SERVICE_NAME, 'getAllActiveAirports', url);
    return this.http.get<IApiResponse<IAirportDto[]>>(url).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'getAllActiveAirports', res); return res?.data || []; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'getAllActiveAirports', err))
    );
  }

  searchAirports(filter: IAirportFilterDto, pageNumber: number = 1, pageSize: number = 10): Observable<IPaginatedResult<IAirportDto>> {
    const url = `${this.baseUrl}/search`;
    let params = new HttpParams().set('pageNumber', pageNumber.toString()).set('pageSize', pageSize.toString());
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params = params.set(key, value.toString());
      }
    });

    logApiRequest(this.SERVICE_NAME, 'searchAirports', url, { filter, pageNumber, pageSize });
    return this.http.get<IApiResponse<IPaginatedResult<IAirportDto>>>(url, { params }).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'searchAirports', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'searchAirports', err))
    );
  }

  getAirportByIataCode(iataCode: string): Observable<IAirportDto> {
    const url = `${this.baseUrl}/${iataCode}`;
    logApiRequest(this.SERVICE_NAME, 'getAirportByIataCode', url);
    return this.http.get<IApiResponse<IAirportDto>>(url).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'getAirportByIataCode', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'getAirportByIataCode', err))
    );
  }

  getAirportByIcaoCode(icaoCode: string): Observable<IAirportDto> {
    const url = `${this.baseUrl}/by-icao/${icaoCode}`;
    logApiRequest(this.SERVICE_NAME, 'getAirportByIcaoCode', url);
    return this.http.get<IApiResponse<IAirportDto>>(url).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'getAirportByIcaoCode', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'getAirportByIcaoCode', err))
    );
  }

  findAirportsByName(name: string): Observable<IAirportDto[]> {
    const url = `${this.baseUrl}/by-name`;
    const params = new HttpParams().set('name', name);
    logApiRequest(this.SERVICE_NAME, 'findAirportsByName', url, { name });
    return this.http.get<IApiResponse<IAirportDto[]>>(url, { params }).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'findAirportsByName', res); return res?.data || []; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'findAirportsByName', err))
    );
  }

  getAirportsByCity(city: string): Observable<IAirportDto[]> {
    const url = `${this.baseUrl}/by-city`;
    const params = new HttpParams().set('city', city);
    logApiRequest(this.SERVICE_NAME, 'getAirportsByCity', url, { city });
    return this.http.get<IApiResponse<IAirportDto[]>>(url, { params }).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'getAirportsByCity', res); return res?.data || []; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'getAirportsByCity', err))
    );
  }

  getAirportsByCountry(countryIsoCode: string): Observable<IAirportDto[]> {
    const url = `${this.baseUrl}/by-country/${countryIsoCode}`;
    logApiRequest(this.SERVICE_NAME, 'getAirportsByCountry', url);
    return this.http.get<IApiResponse<IAirportDto[]>>(url).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'getAirportsByCountry', res); return res?.data || []; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'getAirportsByCountry', err))
    );
  }

  getAllAirportsIncludingDeleted(): Observable<IAirportDto[]> {
    const url = `${this.baseUrl}/all-including-deleted`;
    logApiRequest(this.SERVICE_NAME, 'getAllAirportsIncludingDeleted', url);
    return this.http.get<IApiResponse<IAirportDto[]>>(url).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'getAllAirportsIncludingDeleted', res); return res?.data || []; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'getAllAirportsIncludingDeleted', err))
    );
  }

  createAirport(dto: ICreateAirportDto): Observable<IAirportDto> {
    const url = `${this.baseUrl}`;
    logApiRequest(this.SERVICE_NAME, 'createAirport', url, dto);
    return this.http.post<IApiResponse<IAirportDto>>(url, dto).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'createAirport', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'createAirport', err))
    );
  }

  updateAirport(iataCode: string, dto: IUpdateAirportDto): Observable<IAirportDto> {
    const url = `${this.baseUrl}/${iataCode}`;
    logApiRequest(this.SERVICE_NAME, 'updateAirport', url, dto);
    return this.http.put<IApiResponse<IAirportDto>>(url, dto).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'updateAirport', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'updateAirport', err))
    );
  }

  deleteAirport(iataCode: string): Observable<void> {
    const url = `${this.baseUrl}/${iataCode}`;
    logApiRequest(this.SERVICE_NAME, 'deleteAirport', url);
    return this.http.delete<IApiResponse<void>>(url).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'deleteAirport', res); }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'deleteAirport', err))
    );
  }

  reactivateAirport(iataCode: string): Observable<void> {
    const url = `${this.baseUrl}/${iataCode}/reactivate`;
    logApiRequest(this.SERVICE_NAME, 'reactivateAirport', url);
    return this.http.post<IApiResponse<void>>(url, {}).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'reactivateAirport', res); }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'reactivateAirport', err))
    );
  }
}
