import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

// Shared Models
import { IApiResponse } from '../../models/api-response.model';
import { IPaginatedResult } from '../../models/paging.model'; // Assumed location based on context
import {
  IAircraftTypeDto,
  IAircraftTypeFilterDto,
  ICreateAircraftTypeDto,
  IUpdateAircraftTypeDto
} from '../../models/aircraft-type.model';

// API Helpers
import { logApiRequest, logApiResponse, handleApiError } from '../api-helpers';

@Injectable({
  providedIn: 'root'
})
export class AircraftTypesService {

  private http = inject(HttpClient);

  // ---------------------------------------------------------------------------
  // Base URLs
  // ---------------------------------------------------------------------------
  private readonly SERVICE_NAME = 'AircraftTypesService';
  private readonly baseUrl = `${environment.apiUrl}/v1/admin/aircraft-types`;

  constructor() { }

  // ===========================================================================
  // READ OPERATIONS
  // ===========================================================================

  /**
   * Retrieves a list of all active aircraft types.
   * Endpoint: GET /api/v1/admin/aircraft-types
   */
  getAllActiveAircraftTypes(): Observable<IAircraftTypeDto[]> {
    const url = `${this.baseUrl}`;
    logApiRequest(this.SERVICE_NAME, 'getAllActiveAircraftTypes', url);

    return this.http.get<IApiResponse<IAircraftTypeDto[]>>(url).pipe(
      map(response => {
        logApiResponse(this.SERVICE_NAME, 'getAllActiveAircraftTypes', response);
        if (response && response.statusCode === 200 && response.data) {
          return response.data;
        }
        return [];
      }),
      catchError(error => handleApiError(this.SERVICE_NAME, 'getAllActiveAircraftTypes', error))
    );
  }

  /**
   * Performs an advanced, paginated search for aircraft types.
   * Endpoint: GET /api/v1/admin/aircraft-types/search
   */
  searchAircraftTypes(filter: IAircraftTypeFilterDto, pageNumber: number = 1, pageSize: number = 10): Observable<IPaginatedResult<IAircraftTypeDto>> {
    const url = `${this.baseUrl}/search`;

    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    if (filter.modelContains) params = params.set('modelContains', filter.modelContains);
    if (filter.manufacturer) params = params.set('manufacturer', filter.manufacturer);
    if (filter.minRangeKm) params = params.set('minRangeKm', filter.minRangeKm.toString());
    if (filter.maxRangeKm) params = params.set('maxRangeKm', filter.maxRangeKm.toString());
    if (filter.minSeats) params = params.set('minSeats', filter.minSeats.toString());
    if (filter.maxSeats) params = params.set('maxSeats', filter.maxSeats.toString());
    if (filter.minCargoCapacity) params = params.set('minCargoCapacity', filter.minCargoCapacity.toString());
    if (filter.maxCargoCapacity) params = params.set('maxCargoCapacity', filter.maxCargoCapacity.toString());
    if (filter.includeDeleted) params = params.set('includeDeleted', filter.includeDeleted.toString());

    logApiRequest(this.SERVICE_NAME, 'searchAircraftTypes', url, { filter, pageNumber, pageSize });

    return this.http.get<IApiResponse<IPaginatedResult<IAircraftTypeDto>>>(url, { params }).pipe(
      map(response => {
        logApiResponse(this.SERVICE_NAME, 'searchAircraftTypes', response);
        if (response && response.data) {
          return response.data;
        }
        return { items: [], totalCount: 0, pageNumber, pageSize, totalPages: 0, hasPreviousPage: false, hasNextPage: false };
      }),
      catchError(error => handleApiError(this.SERVICE_NAME, 'searchAircraftTypes', error))
    );
  }

  /**
   * Retrieves a single aircraft type by its ID.
   * Endpoint: GET /api/v1/admin/aircraft-types/{typeId}
   */
  getAircraftTypeById(typeId: number): Observable<IAircraftTypeDto> {
    const url = `${this.baseUrl}/${typeId}`;
    logApiRequest(this.SERVICE_NAME, 'getAircraftTypeById', url, { typeId });

    return this.http.get<IApiResponse<IAircraftTypeDto>>(url).pipe(
      map(response => {
        logApiResponse(this.SERVICE_NAME, 'getAircraftTypeById', response);
        if (response && response.data) {
          return response.data;
        }
        throw new Error(`Aircraft type with ID ${typeId} not found.`);
      }),
      catchError(error => handleApiError(this.SERVICE_NAME, 'getAircraftTypeById', error))
    );
  }

  /**
   * Finds aircraft types where the model name contains the search term.
   * Endpoint: GET /api/v1/admin/aircraft-types/by-model
   */
  findAircraftTypesByModel(model: string): Observable<IAircraftTypeDto[]> {
    const url = `${this.baseUrl}/by-model`;
    const params = new HttpParams().set('model', model);
    logApiRequest(this.SERVICE_NAME, 'findAircraftTypesByModel', url, { model });

    return this.http.get<IApiResponse<IAircraftTypeDto[]>>(url, { params }).pipe(
      map(response => {
        logApiResponse(this.SERVICE_NAME, 'findAircraftTypesByModel', response);
        if (response && response.data) {
          return response.data;
        }
        return [];
      }),
      catchError(error => handleApiError(this.SERVICE_NAME, 'findAircraftTypesByModel', error))
    );
  }

  /**
   * Retrieves all active aircraft types from a specific manufacturer.
   * Endpoint: GET /api/v1/admin/aircraft-types/by-manufacturer
   */
  getAircraftTypesByManufacturer(manufacturer: string): Observable<IAircraftTypeDto[]> {
    const url = `${this.baseUrl}/by-manufacturer`;
    const params = new HttpParams().set('manufacturer', manufacturer);
    logApiRequest(this.SERVICE_NAME, 'getAircraftTypesByManufacturer', url, { manufacturer });

    return this.http.get<IApiResponse<IAircraftTypeDto[]>>(url, { params }).pipe(
      map(response => {
        logApiResponse(this.SERVICE_NAME, 'getAircraftTypesByManufacturer', response);
        if (response && response.data) {
          return response.data;
        }
        return [];
      }),
      catchError(error => handleApiError(this.SERVICE_NAME, 'getAircraftTypesByManufacturer', error))
    );
  }

  /**
   * Retrieves types that can fly a certain distance (in km).
   * Endpoint: GET /api/v1/admin/aircraft-types/suitable-for-route
   */
  getAircraftTypesSuitableForRoute(distanceKm: number): Observable<IAircraftTypeDto[]> {
    const url = `${this.baseUrl}/suitable-for-route`;
    const params = new HttpParams().set('distanceKm', distanceKm.toString());
    logApiRequest(this.SERVICE_NAME, 'getAircraftTypesSuitableForRoute', url, { distanceKm });

    return this.http.get<IApiResponse<IAircraftTypeDto[]>>(url, { params }).pipe(
      map(response => {
        logApiResponse(this.SERVICE_NAME, 'getAircraftTypesSuitableForRoute', response);
        if (response && response.data) {
          return response.data;
        }
        return [];
      }),
      catchError(error => handleApiError(this.SERVICE_NAME, 'getAircraftTypesSuitableForRoute', error))
    );
  }

  /**
   * Retrieves all types, including soft-deleted ones (for admin auditing).
   * Endpoint: GET /api/v1/admin/aircraft-types/all-including-deleted
   */
  getAllAircraftTypesIncludingDeleted(): Observable<IAircraftTypeDto[]> {
    const url = `${this.baseUrl}/all-including-deleted`;
    logApiRequest(this.SERVICE_NAME, 'getAllAircraftTypesIncludingDeleted', url);

    return this.http.get<IApiResponse<IAircraftTypeDto[]>>(url).pipe(
      map(response => {
        logApiResponse(this.SERVICE_NAME, 'getAllAircraftTypesIncludingDeleted', response);
        if (response && response.statusCode === 200 && response.data) {
          return response.data;
        }
        return [];
      }),
      catchError(error => handleApiError(this.SERVICE_NAME, 'getAllAircraftTypesIncludingDeleted', error))
    );
  }

  // ===========================================================================
  // WRITE OPERATIONS
  // ===========================================================================

  /**
   * Creates a new aircraft type.
   * Endpoint: POST /api/v1/admin/aircraft-types
   */
  createAircraftType(createDto: ICreateAircraftTypeDto): Observable<IAircraftTypeDto> {
    const url = `${this.baseUrl}`;
    logApiRequest(this.SERVICE_NAME, 'createAircraftType', url, createDto);

    return this.http.post<IApiResponse<IAircraftTypeDto>>(url, createDto).pipe(
      map(response => {
        logApiResponse(this.SERVICE_NAME, 'createAircraftType', response);
        if (response && response.statusCode === 201 && response.data) {
          return response.data;
        }
        throw new Error(`Failed to create Aircraft Type.`);
      }),
      catchError(error => handleApiError(this.SERVICE_NAME, 'createAircraftType', error))
    );
  }

  /**
   * Updates an existing aircraft type.
   * Endpoint: PUT /api/v1/admin/aircraft-types/{typeId}
   */
  updateAircraftType(typeId: number, updateDto: IUpdateAircraftTypeDto): Observable<IAircraftTypeDto> {
    const url = `${this.baseUrl}/${typeId}`;
    logApiRequest(this.SERVICE_NAME, 'updateAircraftType', url, updateDto);

    return this.http.put<IApiResponse<IAircraftTypeDto>>(url, updateDto).pipe(
      map(response => {
        logApiResponse(this.SERVICE_NAME, 'updateAircraftType', response);
        if (response && response.statusCode === 200 && response.data) {
          return response.data;
        }
        throw new Error(`Failed to update Aircraft Type.`);
      }),
      catchError(error => handleApiError(this.SERVICE_NAME, 'updateAircraftType', error))
    );
  }

  /**
   * Soft-deletes an aircraft type (if no dependencies exist).
   * Endpoint: DELETE /api/v1/admin/aircraft-types/{typeId}
   */
  deleteAircraftType(typeId: number): Observable<boolean> {
    const url = `${this.baseUrl}/${typeId}`;
    logApiRequest(this.SERVICE_NAME, 'deleteAircraftType', url, { typeId });

    return this.http.delete<IApiResponse>(url).pipe(
      map(response => {
        logApiResponse(this.SERVICE_NAME, 'deleteAircraftType', response);
        if (response && response.statusCode === 200) {
          return true;
        }
        return false;
      }),
      catchError(error => handleApiError(this.SERVICE_NAME, 'deleteAircraftType', error))
    );
  }

  /**
   * Reactivates a soft-deleted aircraft type.
   * Endpoint: POST /api/v1/admin/aircraft-types/{typeId}/reactivate
   */
  reactivateAircraftType(typeId: number): Observable<boolean> {
    const url = `${this.baseUrl}/${typeId}/reactivate`;
    logApiRequest(this.SERVICE_NAME, 'reactivateAircraftType', url, { typeId });

    return this.http.post<IApiResponse>(url, {}).pipe(
      map(response => {
        logApiResponse(this.SERVICE_NAME, 'reactivateAircraftType', response);
        if (response && response.statusCode === 200) {
          return true;
        }
        return false;
      }),
      catchError(error => handleApiError(this.SERVICE_NAME, 'reactivateAircraftType', error))
    );
  }

}
