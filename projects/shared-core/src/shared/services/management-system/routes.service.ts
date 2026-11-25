import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

import { IApiResponse } from '../../models/api-response.model';
import { IPaginatedResult } from '../../models/paging.model';
import { logApiRequest, logApiResponse, handleApiError } from '../api-helpers';

import {
  IRouteFilterDto, IRouteDto, IRouteDetailDto, ICreateRouteDto, IUpdateRouteDto,
  IRouteOperatorDto, IAssignOperatorDto, IUpdateOperatorDto
} from '../../models/routes.model';

@Injectable({
  providedIn: 'root'
})
export class RoutesService {
  private http = inject(HttpClient);
  private readonly SERVICE_NAME = 'RoutesService';
  private readonly baseUrl = `${environment.apiUrl}/v1/admin/routes`;

  searchRoutes(filter: IRouteFilterDto, pageNumber: number = 1, pageSize: number = 10): Observable<IPaginatedResult<IRouteDto>> {
    const url = `${this.baseUrl}/search`;
    let params = new HttpParams().set('pageNumber', pageNumber.toString()).set('pageSize', pageSize.toString());
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params = params.set(key, value.toString());
      }
    });

    logApiRequest(this.SERVICE_NAME, 'searchRoutes', url, { filter, pageNumber, pageSize });
    return this.http.get<IApiResponse<IPaginatedResult<IRouteDto>>>(url, { params }).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'searchRoutes', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'searchRoutes', err))
    );
  }

  getRouteById(routeId: number): Observable<IRouteDto> {
    const url = `${this.baseUrl}/${routeId}`;
    logApiRequest(this.SERVICE_NAME, 'getRouteById', url);
    return this.http.get<IApiResponse<IRouteDto>>(url).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'getRouteById', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'getRouteById', err))
    );
  }

  getRouteWithOperators(routeId: number): Observable<IRouteDetailDto> {
    const url = `${this.baseUrl}/${routeId}/details`;
    logApiRequest(this.SERVICE_NAME, 'getRouteWithOperators', url);
    return this.http.get<IApiResponse<IRouteDetailDto>>(url).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'getRouteWithOperators', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'getRouteWithOperators', err))
    );
  }

  getActiveRoutesByOrigin(originIataCode: string): Observable<IRouteDto[]> {
    const url = `${this.baseUrl}/by-origin/${originIataCode}`;
    logApiRequest(this.SERVICE_NAME, 'getActiveRoutesByOrigin', url);
    return this.http.get<IApiResponse<IRouteDto[]>>(url).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'getActiveRoutesByOrigin', res); return res?.data || []; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'getActiveRoutesByOrigin', err))
    );
  }

  getActiveRoutesByDestination(destinationIataCode: string): Observable<IRouteDto[]> {
    const url = `${this.baseUrl}/by-destination/${destinationIataCode}`;
    logApiRequest(this.SERVICE_NAME, 'getActiveRoutesByDestination', url);
    return this.http.get<IApiResponse<IRouteDto[]>>(url).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'getActiveRoutesByDestination', res); return res?.data || []; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'getActiveRoutesByDestination', err))
    );
  }

  createRoute(dto: ICreateRouteDto): Observable<IRouteDto> {
    const url = `${this.baseUrl}`;
    logApiRequest(this.SERVICE_NAME, 'createRoute', url, dto);
    return this.http.post<IApiResponse<IRouteDto>>(url, dto).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'createRoute', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'createRoute', err))
    );
  }

  updateRoute(routeId: number, dto: IUpdateRouteDto): Observable<IRouteDto> {
    const url = `${this.baseUrl}/${routeId}`;
    logApiRequest(this.SERVICE_NAME, 'updateRoute', url, dto);
    return this.http.put<IApiResponse<IRouteDto>>(url, dto).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'updateRoute', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'updateRoute', err))
    );
  }

  deleteRoute(routeId: number): Observable<void> {
    const url = `${this.baseUrl}/${routeId}`;
    logApiRequest(this.SERVICE_NAME, 'deleteRoute', url);
    return this.http.delete<IApiResponse<void>>(url).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'deleteRoute', res); }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'deleteRoute', err))
    );
  }

  reactivateRoute(routeId: number): Observable<void> {
    const url = `${this.baseUrl}/${routeId}/reactivate`;
    logApiRequest(this.SERVICE_NAME, 'reactivateRoute', url);
    return this.http.post<IApiResponse<void>>(url, {}).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'reactivateRoute', res); }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'reactivateRoute', err))
    );
  }

  // Route Operators Endpoints
  assignOperatorToRoute(dto: IAssignOperatorDto): Observable<IRouteOperatorDto> {
    const url = `${this.baseUrl}/operators`;
    logApiRequest(this.SERVICE_NAME, 'assignOperatorToRoute', url, dto);
    return this.http.post<IApiResponse<IRouteOperatorDto>>(url, dto).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'assignOperatorToRoute', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'assignOperatorToRoute', err))
    );
  }

  updateOperatorOnRoute(routeId: number, airlineIataCode: string, dto: IUpdateOperatorDto): Observable<IRouteOperatorDto> {
    const url = `${this.baseUrl}/operators/${routeId}/${airlineIataCode}`;
    logApiRequest(this.SERVICE_NAME, 'updateOperatorOnRoute', url, dto);
    return this.http.put<IApiResponse<IRouteOperatorDto>>(url, dto).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'updateOperatorOnRoute', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'updateOperatorOnRoute', err))
    );
  }

  removeOperatorFromRoute(routeId: number, airlineIataCode: string): Observable<void> {
    const url = `${this.baseUrl}/operators/${routeId}/${airlineIataCode}`;
    logApiRequest(this.SERVICE_NAME, 'removeOperatorFromRoute', url);
    return this.http.delete<IApiResponse<void>>(url).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'removeOperatorFromRoute', res); }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'removeOperatorFromRoute', err))
    );
  }
}
