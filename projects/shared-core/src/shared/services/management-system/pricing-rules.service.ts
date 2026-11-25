import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

import { IApiResponse } from '../../models/api-response.model';
import { IPaginatedResult } from '../../models/paging.model';
import { logApiRequest, logApiResponse, handleApiError } from '../api-helpers';

import { 
  IPricingAttributeFilterDto, IContextualPricingAttributeDto, ICreatePricingAttributeDto,
  IUpdatePricingAttributeDto, IPricingContextDto 
} from '../../models/pricing-rules.model';

@Injectable({
  providedIn: 'root'
})
export class PricingRulesService {
  private http = inject(HttpClient);
  private readonly SERVICE_NAME = 'PricingRulesService';
  private readonly baseUrl = `${environment.apiUrl}/v1/admin/pricing-rules`;

  getAllActiveAttributeSets(): Observable<IContextualPricingAttributeDto[]> {
    const url = `${this.baseUrl}`;
    logApiRequest(this.SERVICE_NAME, 'getAllActiveAttributeSets', url);
    return this.http.get<IApiResponse<IContextualPricingAttributeDto[]>>(url).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'getAllActiveAttributeSets', res); return res?.data || []; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'getAllActiveAttributeSets', err))
    );
  }

  searchAttributeSets(filter: IPricingAttributeFilterDto, pageNumber: number = 1, pageSize: number = 10): Observable<IPaginatedResult<IContextualPricingAttributeDto>> {
    const url = `${this.baseUrl}/search`;
    let params = new HttpParams().set('pageNumber', pageNumber.toString()).set('pageSize', pageSize.toString());
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params = params.set(key, value.toString());
      }
    });

    logApiRequest(this.SERVICE_NAME, 'searchAttributeSets', url, { filter, pageNumber, pageSize });
    return this.http.get<IApiResponse<IPaginatedResult<IContextualPricingAttributeDto>>>(url, { params }).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'searchAttributeSets', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'searchAttributeSets', err))
    );
  }

  getAttributeSetById(attributeId: number): Observable<IContextualPricingAttributeDto> {
    const url = `${this.baseUrl}/${attributeId}`;
    logApiRequest(this.SERVICE_NAME, 'getAttributeSetById', url);
    return this.http.get<IApiResponse<IContextualPricingAttributeDto>>(url).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'getAttributeSetById', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'getAttributeSetById', err))
    );
  }

  findBestMatchingAttributeSets(contextDto: IPricingContextDto): Observable<IContextualPricingAttributeDto[]> {
    const url = `${this.baseUrl}/find-matches`;
    logApiRequest(this.SERVICE_NAME, 'findBestMatchingAttributeSets', url, contextDto);
    return this.http.post<IApiResponse<IContextualPricingAttributeDto[]>>(url, contextDto).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'findBestMatchingAttributeSets', res); return res?.data || []; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'findBestMatchingAttributeSets', err))
    );
  }

  createAttributeSet(dto: ICreatePricingAttributeDto): Observable<IContextualPricingAttributeDto> {
    const url = `${this.baseUrl}`;
    logApiRequest(this.SERVICE_NAME, 'createAttributeSet', url, dto);
    return this.http.post<IApiResponse<IContextualPricingAttributeDto>>(url, dto).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'createAttributeSet', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'createAttributeSet', err))
    );
  }

  updateAttributeSet(attributeId: number, dto: IUpdatePricingAttributeDto): Observable<IContextualPricingAttributeDto> {
    const url = `${this.baseUrl}/${attributeId}`;
    logApiRequest(this.SERVICE_NAME, 'updateAttributeSet', url, dto);
    return this.http.put<IApiResponse<IContextualPricingAttributeDto>>(url, dto).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'updateAttributeSet', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'updateAttributeSet', err))
    );
  }

  deleteAttributeSet(attributeId: number): Observable<void> {
    const url = `${this.baseUrl}/${attributeId}`;
    logApiRequest(this.SERVICE_NAME, 'deleteAttributeSet', url);
    return this.http.delete<IApiResponse<void>>(url).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'deleteAttributeSet', res); }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'deleteAttributeSet', err))
    );
  }

  reactivateAttributeSet(attributeId: number): Observable<void> {
    const url = `${this.baseUrl}/${attributeId}/reactivate`;
    logApiRequest(this.SERVICE_NAME, 'reactivateAttributeSet', url);
    return this.http.post<IApiResponse<void>>(url, {}).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'reactivateAttributeSet', res); }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'reactivateAttributeSet', err))
    );
  }
}
