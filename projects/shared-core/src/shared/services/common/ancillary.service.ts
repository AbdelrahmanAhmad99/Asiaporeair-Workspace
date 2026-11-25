import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

import { IApiResponse } from '../../../shared/models/api-response.model';
import { logApiRequest, logApiResponse, handleApiError } from '../api-helpers';

import {
  IAncillaryProduct,
  IAncillarySale,
  ICreateAncillarySaleRequest,
  IAncillaryProductFilter,
  IPaginatedAncillaryResponse,
  ICreateAncillaryProductRequest,
  IUpdateAncillaryProductRequest
} from '../../models/ancillary.model';

@Injectable({
  providedIn: 'root'
})
export class AncillaryService {

  private http = inject(HttpClient);
  private readonly SERVICE_NAME = 'AncillaryService';
  private readonly customerBaseUrl = `${environment.apiUrl}/v1/ancillary`;
  private readonly adminBaseUrl = `${environment.apiUrl}/v1/ancillary/admin`;

  constructor() { }

  getAvailableProducts(flightInstanceId: number): Observable<IAncillaryProduct[]> {
    const url = `${this.customerBaseUrl}/available/${flightInstanceId}`;
    logApiRequest(this.SERVICE_NAME, 'getAvailableProducts', url, { flightInstanceId });

    return this.http.get<IApiResponse<IAncillaryProduct[]>>(url).pipe(
      map(response => {
        logApiResponse(this.SERVICE_NAME, 'getAvailableProducts', response);
        return response.data || [];
      }),
      catchError(error => handleApiError(this.SERVICE_NAME, 'getAvailableProducts', error))
    );
  }

  getAncillariesForBooking(bookingId: number): Observable<IAncillarySale[]> {
    const url = `${this.customerBaseUrl}/booking/${bookingId}`;
    logApiRequest(this.SERVICE_NAME, 'getAncillariesForBooking', url, { bookingId });

    return this.http.get<IApiResponse<IAncillarySale[]>>(url).pipe(
      map(response => {
        logApiResponse(this.SERVICE_NAME, 'getAncillariesForBooking', response);
        return response.data || [];
      }),
      catchError(error => handleApiError(this.SERVICE_NAME, 'getAncillariesForBooking', error))
    );
  }

  addAncillaryToBooking(request: ICreateAncillarySaleRequest): Observable<IAncillarySale> {
    const url = `${this.customerBaseUrl}/booking`;
    logApiRequest(this.SERVICE_NAME, 'addAncillaryToBooking', url, request);

    return this.http.post<IApiResponse<IAncillarySale>>(url, request).pipe(
      map(response => {
        logApiResponse(this.SERVICE_NAME, 'addAncillaryToBooking', response);
        if (response && response.data) {
          return response.data;
        }
        throw new Error('Failed to add ancillary. No data returned.');
      }),
      catchError(error => handleApiError(this.SERVICE_NAME, 'addAncillaryToBooking', error))
    );
  }

  removeAncillaryFromBooking(saleId: number): Observable<string> {
    const url = `${this.customerBaseUrl}/booking/sale/${saleId}`;
    logApiRequest(this.SERVICE_NAME, 'removeAncillaryFromBooking', url, { saleId });

    return this.http.delete<IApiResponse<string>>(url).pipe(
      map(response => {
        logApiResponse(this.SERVICE_NAME, 'removeAncillaryFromBooking', response);
        return response.message || 'Item removed successfully';
      }),
      catchError(error => handleApiError(this.SERVICE_NAME, 'removeAncillaryFromBooking', error))
    );
  }

  getProductsPaginated(
    filter: IAncillaryProductFilter,
    pageNumber: number = 1,
    pageSize: number = 10
  ): Observable<IPaginatedAncillaryResponse> {
    const url = `${this.adminBaseUrl}/products`;
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString())
      .set('includeDeleted', filter.includeDeleted ? 'true' : 'false');

    if (filter.nameContains) params = params.set('nameContains', filter.nameContains);
    if (filter.category) params = params.set('category', filter.category);
    if (filter.minCost != null) params = params.set('minCost', filter.minCost.toString());
    if (filter.maxCost != null) params = params.set('maxCost', filter.maxCost.toString());

    logApiRequest(this.SERVICE_NAME, 'getProductsPaginated', url, { filter, pageNumber, pageSize });

    return this.http.get<IApiResponse<IPaginatedAncillaryResponse>>(url, { params }).pipe(
      map(response => {
        logApiResponse(this.SERVICE_NAME, 'getProductsPaginated', response);
        if (response && response.data) {
          return response.data;
        }
        throw new Error('Paginated ancillary products not found.');
      }),
      catchError(error => handleApiError(this.SERVICE_NAME, 'getProductsPaginated', error))
    );
  }

  getProductById(productId: number): Observable<IAncillaryProduct> {
    const url = `${this.adminBaseUrl}/product/${productId}`;
    logApiRequest(this.SERVICE_NAME, 'getProductById', url, { productId });

    return this.http.get<IApiResponse<IAncillaryProduct>>(url).pipe(
      map(response => {
        logApiResponse(this.SERVICE_NAME, 'getProductById', response);
        if (response && response.data) {
          return response.data;
        }
        throw new Error(`Product with ID ${productId} not found.`);
      }),
      catchError(error => handleApiError(this.SERVICE_NAME, 'getProductById', error))
    );
  }

  createProduct(request: ICreateAncillaryProductRequest): Observable<IAncillaryProduct> {
    const url = `${this.adminBaseUrl}/product`;
    logApiRequest(this.SERVICE_NAME, 'createProduct', url, request);

    return this.http.post<IApiResponse<IAncillaryProduct>>(url, request).pipe(
      map(response => {
        logApiResponse(this.SERVICE_NAME, 'createProduct', response);
        if (response && response.data) {
          return response.data;
        }
        throw new Error('Failed to create product.');
      }),
      catchError(error => handleApiError(this.SERVICE_NAME, 'createProduct', error))
    );
  }

  updateProduct(productId: number, request: IUpdateAncillaryProductRequest): Observable<IAncillaryProduct> {
    const url = `${this.adminBaseUrl}/product/${productId}`;
    logApiRequest(this.SERVICE_NAME, 'updateProduct', url, { productId, ...request });

    return this.http.put<IApiResponse<IAncillaryProduct>>(url, request).pipe(
      map(response => {
        logApiResponse(this.SERVICE_NAME, 'updateProduct', response);
        if (response && response.data) {
          return response.data;
        }
        throw new Error(`Failed to update product with ID ${productId}.`);
      }),
      catchError(error => handleApiError(this.SERVICE_NAME, 'updateProduct', error))
    );
  }

  deleteProduct(productId: number): Observable<string> {
    const url = `${this.adminBaseUrl}/product/${productId}`;
    logApiRequest(this.SERVICE_NAME, 'deleteProduct', url, { productId });

    return this.http.delete<IApiResponse<null>>(url).pipe(
      map(response => {
        logApiResponse(this.SERVICE_NAME, 'deleteProduct', response);
        return response?.message || 'Product deleted successfully';
      }),
      catchError(error => handleApiError(this.SERVICE_NAME, 'deleteProduct', error))
    );
  }
}