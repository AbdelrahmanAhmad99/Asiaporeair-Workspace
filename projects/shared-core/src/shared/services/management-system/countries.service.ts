import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

import { IApiResponse } from '../../models/api-response.model';
import { logApiRequest, logApiResponse, handleApiError } from '../api-helpers';

import { 
  ICountryDto, ICountryWithAirportsDto, ICreateCountryDto, IUpdateCountryDto
} from '../../models/country.model';

@Injectable({
  providedIn: 'root'
})
export class CountriesService {
  private http = inject(HttpClient);
  private readonly SERVICE_NAME = 'CountriesService';
  private readonly baseUrl = `${environment.apiUrl}/v1/admin/countries`;

  getAllActiveCountries(): Observable<ICountryDto[]> {
    const url = `${this.baseUrl}`;
    logApiRequest(this.SERVICE_NAME, 'getAllActiveCountries', url);
    return this.http.get<IApiResponse<ICountryDto[]>>(url).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'getAllActiveCountries', res); return res?.data || []; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'getAllActiveCountries', err))
    );
  }

  getCountryByIsoCode(isoCode: string): Observable<ICountryDto> {
    const url = `${this.baseUrl}/${isoCode}`;
    logApiRequest(this.SERVICE_NAME, 'getCountryByIsoCode', url);
    return this.http.get<IApiResponse<ICountryDto>>(url).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'getCountryByIsoCode', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'getCountryByIsoCode', err))
    );
  }

  getCountryByName(name: string): Observable<ICountryDto> {
    const url = `${this.baseUrl}/by-name`;
    const params = new HttpParams().set('name', name);
    logApiRequest(this.SERVICE_NAME, 'getCountryByName', url, { name });
    return this.http.get<IApiResponse<ICountryDto>>(url, { params }).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'getCountryByName', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'getCountryByName', err))
    );
  }

  getCountriesByContinent(continentName: string): Observable<ICountryDto[]> {
    const url = `${this.baseUrl}/by-continent`;
    const params = new HttpParams().set('continentName', continentName);
    logApiRequest(this.SERVICE_NAME, 'getCountriesByContinent', url, { continentName });
    return this.http.get<IApiResponse<ICountryDto[]>>(url, { params }).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'getCountriesByContinent', res); return res?.data || []; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'getCountriesByContinent', err))
    );
  }

  getCountryWithAirports(isoCode: string): Observable<ICountryWithAirportsDto> {
    const url = `${this.baseUrl}/${isoCode}/airports`;
    logApiRequest(this.SERVICE_NAME, 'getCountryWithAirports', url);
    return this.http.get<IApiResponse<ICountryWithAirportsDto>>(url).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'getCountryWithAirports', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'getCountryWithAirports', err))
    );
  }

  createCountry(dto: ICreateCountryDto): Observable<ICountryDto> {
    const url = `${this.baseUrl}`;
    logApiRequest(this.SERVICE_NAME, 'createCountry', url, dto);
    return this.http.post<IApiResponse<ICountryDto>>(url, dto).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'createCountry', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'createCountry', err))
    );
  }

  updateCountry(isoCode: string, dto: IUpdateCountryDto): Observable<ICountryDto> {
    const url = `${this.baseUrl}/${isoCode}`;
    logApiRequest(this.SERVICE_NAME, 'updateCountry', url, dto);
    return this.http.put<IApiResponse<ICountryDto>>(url, dto).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'updateCountry', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'updateCountry', err))
    );
  }

  deleteCountry(isoCode: string): Observable<void> {
    const url = `${this.baseUrl}/${isoCode}`;
    logApiRequest(this.SERVICE_NAME, 'deleteCountry', url);
    return this.http.delete<IApiResponse<void>>(url).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'deleteCountry', res); }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'deleteCountry', err))
    );
  }

  reactivateCountry(isoCode: string): Observable<void> {
    const url = `${this.baseUrl}/${isoCode}/reactivate`;
    logApiRequest(this.SERVICE_NAME, 'reactivateCountry', url);
    return this.http.post<IApiResponse<void>>(url, {}).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'reactivateCountry', res); }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'reactivateCountry', err))
    );
  }
}
