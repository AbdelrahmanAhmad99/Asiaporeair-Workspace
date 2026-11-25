import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

import { IApiResponse } from '../../models/api-response.model';
import { IPaginatedResult } from '../../models/paging.model';
import { logApiRequest, logApiResponse, handleApiError } from '../api-helpers';
import {
  IAircraftFilterDto, IAircraftDto, IAircraftDetailDto, ICreateAircraftDto, IUpdateAircraftDto, IUpdateAircraftStatusDto, IAddFlightHoursDto,
  IAircraftConfigDto, ICreateAircraftConfigDto, IUpdateAircraftConfigDto, ICabinClassDto, ICreateCabinClassDto,
  ICreateSeatDto, IUpdateSeatDto
} from '../../models/aircraft.model';

@Injectable({
  providedIn: 'root'
})
export class AircraftService {
  private http = inject(HttpClient);
  private readonly SERVICE_NAME = 'AircraftService';
  private readonly baseUrl = `${environment.apiUrl}/v1/admin/fleet`;

  searchAircraft(filter: IAircraftFilterDto, pageNumber: number = 1, pageSize: number = 10): Observable<IPaginatedResult<IAircraftDto>> {
    const url = `${this.baseUrl}/aircraft/search`;
    let params = new HttpParams().set('pageNumber', pageNumber.toString()).set('pageSize', pageSize.toString());
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params = params.set(key, value.toString());
      }
    });

    logApiRequest(this.SERVICE_NAME, 'searchAircraft', url, { filter, pageNumber, pageSize });
    return this.http.get<IApiResponse<IPaginatedResult<IAircraftDto>>>(url, { params }).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'searchAircraft', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'searchAircraft', err))
    );
  }

  getAircraftByTailNumber(tailNumber: string): Observable<IAircraftDto> {
    const url = `${this.baseUrl}/aircraft/${tailNumber}`;
    logApiRequest(this.SERVICE_NAME, 'getAircraftByTailNumber', url);
    return this.http.get<IApiResponse<IAircraftDto>>(url).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'getAircraftByTailNumber', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'getAircraftByTailNumber', err))
    );
  }

  getAircraftDetails(tailNumber: string): Observable<IAircraftDetailDto> {
    const url = `${this.baseUrl}/aircraft/${tailNumber}/details`;
    logApiRequest(this.SERVICE_NAME, 'getAircraftDetails', url);
    return this.http.get<IApiResponse<IAircraftDetailDto>>(url).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'getAircraftDetails', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'getAircraftDetails', err))
    );
  }

  createAircraft(dto: ICreateAircraftDto): Observable<IAircraftDto> {
    const url = `${this.baseUrl}/aircraft`;
    logApiRequest(this.SERVICE_NAME, 'createAircraft', url, dto);
    return this.http.post<IApiResponse<IAircraftDto>>(url, dto).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'createAircraft', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'createAircraft', err))
    );
  }

  updateAircraft(tailNumber: string, dto: IUpdateAircraftDto): Observable<IAircraftDto> {
    const url = `${this.baseUrl}/aircraft/${tailNumber}`;
    logApiRequest(this.SERVICE_NAME, 'updateAircraft', url, dto);
    return this.http.put<IApiResponse<IAircraftDto>>(url, dto).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'updateAircraft', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'updateAircraft', err))
    );
  }

  updateAircraftStatus(tailNumber: string, dto: IUpdateAircraftStatusDto): Observable<void> {
    const url = `${this.baseUrl}/aircraft/${tailNumber}/status`;
    logApiRequest(this.SERVICE_NAME, 'updateAircraftStatus', url, dto);
    return this.http.put<IApiResponse<void>>(url, dto).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'updateAircraftStatus', res); }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'updateAircraftStatus', err))
    );
  }

  addFlightHours(tailNumber: string, dto: IAddFlightHoursDto): Observable<{ newTotalHours: number }> {
    const url = `${this.baseUrl}/aircraft/${tailNumber}/add-hours`;
    logApiRequest(this.SERVICE_NAME, 'addFlightHours', url, dto);
    return this.http.post<IApiResponse<{ newTotalHours: number }>>(url, dto).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'addFlightHours', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'addFlightHours', err))
    );
  }

  deleteAircraft(tailNumber: string): Observable<void> {
    const url = `${this.baseUrl}/aircraft/${tailNumber}`;
    logApiRequest(this.SERVICE_NAME, 'deleteAircraft', url);
    return this.http.delete<IApiResponse<void>>(url).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'deleteAircraft', res); }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'deleteAircraft', err))
    );
  }

  reactivateAircraft(tailNumber: string): Observable<void> {
    const url = `${this.baseUrl}/aircraft/${tailNumber}/reactivate`;
    logApiRequest(this.SERVICE_NAME, 'reactivateAircraft', url);
    return this.http.post<IApiResponse<void>>(url, {}).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'reactivateAircraft', res); }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'reactivateAircraft', err))
    );
  }

  getConfigsForAircraft(tailNumber: string): Observable<IAircraftConfigDto[]> {
    const url = `${this.baseUrl}/aircraft/${tailNumber}/configurations`;
    logApiRequest(this.SERVICE_NAME, 'getConfigsForAircraft', url);
    return this.http.get<IApiResponse<IAircraftConfigDto[]>>(url).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'getConfigsForAircraft', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'getConfigsForAircraft', err))
    );
  }

  getConfigDetails(configId: number): Observable<IAircraftConfigDto> {
    const url = `${this.baseUrl}/configurations/${configId}`;
    logApiRequest(this.SERVICE_NAME, 'getConfigDetails', url);
    return this.http.get<IApiResponse<IAircraftConfigDto>>(url).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'getConfigDetails', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'getConfigDetails', err))
    );
  }

  createAircraftConfig(tailNumber: string, dto: ICreateAircraftConfigDto): Observable<IAircraftConfigDto> {
    const url = `${this.baseUrl}/aircraft/${tailNumber}/configurations`;
    logApiRequest(this.SERVICE_NAME, 'createAircraftConfig', url, dto);
    return this.http.post<IApiResponse<IAircraftConfigDto>>(url, dto).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'createAircraftConfig', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'createAircraftConfig', err))
    );
  }

  updateAircraftConfig(configId: number, dto: IUpdateAircraftConfigDto): Observable<IAircraftConfigDto> {
    const url = `${this.baseUrl}/configurations/${configId}`;
    logApiRequest(this.SERVICE_NAME, 'updateAircraftConfig', url, dto);
    return this.http.put<IApiResponse<IAircraftConfigDto>>(url, dto).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'updateAircraftConfig', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'updateAircraftConfig', err))
    );
  }

  deleteAircraftConfig(configId: number): Observable<void> {
    const url = `${this.baseUrl}/configurations/${configId}`;
    logApiRequest(this.SERVICE_NAME, 'deleteAircraftConfig', url);
    return this.http.delete<IApiResponse<void>>(url).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'deleteAircraftConfig', res); }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'deleteAircraftConfig', err))
    );
  }

  getCabinClassesForConfig(configId: number): Observable<ICabinClassDto[]> {
    const url = `${this.baseUrl}/configurations/${configId}/cabin-classes`;
    logApiRequest(this.SERVICE_NAME, 'getCabinClassesForConfig', url);
    return this.http.get<IApiResponse<ICabinClassDto[]>>(url).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'getCabinClassesForConfig', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'getCabinClassesForConfig', err))
    );
  }

  createCabinClass(dto: ICreateCabinClassDto): Observable<ICabinClassDto> {
    const url = `${this.baseUrl}/configurations/cabin-classes`;
    logApiRequest(this.SERVICE_NAME, 'createCabinClass', url, dto);
    return this.http.post<IApiResponse<ICabinClassDto>>(url, dto).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'createCabinClass', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'createCabinClass', err))
    );
  }

  deleteCabinClass(cabinClassId: number): Observable<void> {
    const url = `${this.baseUrl}/configurations/cabin-classes/${cabinClassId}`;
    logApiRequest(this.SERVICE_NAME, 'deleteCabinClass', url);
    return this.http.delete<IApiResponse<void>>(url).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'deleteCabinClass', res); }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'deleteCabinClass', err))
    );
  }

  getSeatMapForCabinClass(cabinClassId: number): Observable<any> {
    const url = `${this.baseUrl}/configurations/cabin-classes/${cabinClassId}/seat-map`;
    logApiRequest(this.SERVICE_NAME, 'getSeatMapForCabinClass', url);
    return this.http.get<IApiResponse<any>>(url).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'getSeatMapForCabinClass', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'getSeatMapForCabinClass', err))
    );
  }

  createSeat(dto: ICreateSeatDto): Observable<any> {
    const url = `${this.baseUrl}/seats`;
    logApiRequest(this.SERVICE_NAME, 'createSeat', url, dto);
    return this.http.post<IApiResponse<any>>(url, dto).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'createSeat', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'createSeat', err))
    );
  }

  updateSeat(seatId: string, dto: IUpdateSeatDto): Observable<any> {
    const url = `${this.baseUrl}/seats/${seatId}`;
    logApiRequest(this.SERVICE_NAME, 'updateSeat', url, dto);
    return this.http.put<IApiResponse<any>>(url, dto).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'updateSeat', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'updateSeat', err))
    );
  }

  deleteSeat(seatId: string): Observable<void> {
    const url = `${this.baseUrl}/seats/${seatId}`;
    logApiRequest(this.SERVICE_NAME, 'deleteSeat', url);
    return this.http.delete<IApiResponse<void>>(url).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'deleteSeat', res); }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'deleteSeat', err))
    );
  }
}
