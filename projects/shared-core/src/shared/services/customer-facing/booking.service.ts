import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

import { IApiResponse } from '../../../shared/models/api-response.model';
import { IPaginatedResult } from '../../models/paging.model';
import { logApiRequest, logApiResponse, handleApiError } from '../api-helpers';

import {
  IBookingDto,
  ICreateBookingDto,
  IBookingDetailDto,
  IBookingCancelDto
} from '../../models/booking.model';
import {
  IPassengerDto,
  IUpdatePassengerDto
} from '../../models/passenger.model';

@Injectable({
  providedIn: 'root'
})
export class BookingService {

  private http = inject(HttpClient);
  private readonly SERVICE_NAME = 'BookingService';
  private readonly customerBaseUrl = `${environment.apiUrl}/v1/Booking`;

  constructor() { }

  createBooking(createDto: ICreateBookingDto): Observable<IBookingDto> {
    const url = `${this.customerBaseUrl}`;
    logApiRequest(this.SERVICE_NAME, 'createBooking', url, createDto);

    return this.http.post<IApiResponse<IBookingDto>>(url, createDto).pipe(
      map(response => {
        logApiResponse(this.SERVICE_NAME, 'createBooking', response);
        if (response && response.statusCode === 201 && response.data) {
          return response.data;
        }
        throw new Error(`Booking Creation failed. Status: ${response?.statusCode}, Message: ${response?.message}`);
      }),
      catchError(error => handleApiError(this.SERVICE_NAME, 'createBooking', error))
    );
  }

  getMyBookings(pageNumber: number = 1, pageSize: number = 10): Observable<IPaginatedResult<IBookingDto>> {
    const url = `${this.customerBaseUrl}/my-bookings`;
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    logApiRequest(this.SERVICE_NAME, 'getMyBookings', url, { pageNumber, pageSize });

    return this.http.get<IApiResponse<IPaginatedResult<IBookingDto>>>(url, { params }).pipe(
      map(response => {
        logApiResponse(this.SERVICE_NAME, 'getMyBookings', response);
        if (response && response.data) {
          return response.data;
        }
        return { items: [], totalCount: 0, pageNumber, pageSize, totalPages: 0, hasPreviousPage: false, hasNextPage: false };
      }),
      catchError(error => handleApiError(this.SERVICE_NAME, 'getMyBookings', error))
    );
  }

  getBookingDetails(bookingId: number): Observable<IBookingDetailDto> {
    const url = `${this.customerBaseUrl}/${bookingId}/details`;
    logApiRequest(this.SERVICE_NAME, 'getBookingDetails', url, { bookingId });

    return this.http.get<IApiResponse<IBookingDetailDto>>(url).pipe(
      map(response => {
        logApiResponse(this.SERVICE_NAME, 'getBookingDetails', response);
        if (response && response.data) {
          return response.data;
        }
        throw new Error('Booking details not found in server response.');
      }),
      catchError(error => handleApiError(this.SERVICE_NAME, 'getBookingDetails', error))
    );
  }

  getBookingByReference(bookingReference: string): Observable<IBookingDetailDto> {
    const url = `${this.customerBaseUrl}/by-reference/${bookingReference}`;
    logApiRequest(this.SERVICE_NAME, 'getBookingByReference', url, { bookingReference });

    return this.http.get<IApiResponse<IBookingDetailDto>>(url).pipe(
      map(response => {
        logApiResponse(this.SERVICE_NAME, 'getBookingByReference', response);
        if (response && response.data) {
          return response.data;
        }
        throw new Error(`Booking reference '${bookingReference}' not found.`);
      }),
      catchError(error => handleApiError(this.SERVICE_NAME, 'getBookingByReference', error))
    );
  }

  cancelBooking(bookingId: number, reason?: string): Observable<boolean> {
    const url = `${this.customerBaseUrl}/${bookingId}/cancel`;
    const payload: IBookingCancelDto = { reason };

    logApiRequest(this.SERVICE_NAME, 'cancelBooking', url, payload);

    return this.http.post<IApiResponse>(url, payload).pipe(
      map(response => {
        logApiResponse(this.SERVICE_NAME, 'cancelBooking', response);
        if (response && response.statusCode === 200) {
          return true;
        }
        return false;
      }),
      catchError(error => handleApiError(this.SERVICE_NAME, 'cancelBooking', error))
    );
  }

  getMySavedPassengers(): Observable<IPassengerDto[]> {
    const url = `${this.customerBaseUrl}/my-passengers`;
    logApiRequest(this.SERVICE_NAME, 'getMySavedPassengers', url);

    return this.http.get<IApiResponse<IPassengerDto[]>>(url).pipe(
      map(response => {
        logApiResponse(this.SERVICE_NAME, 'getMySavedPassengers', response);
        if (response && response.data) {
          return response.data;
        }
        return [];
      }),
      catchError(error => handleApiError(this.SERVICE_NAME, 'getMySavedPassengers', error))
    );
  }

  getSavedPassenger(passengerId: number): Observable<IPassengerDto> {
    const url = `${this.customerBaseUrl}/passengers/${passengerId}`;
    logApiRequest(this.SERVICE_NAME, 'getSavedPassenger', url, { passengerId });

    return this.http.get<IApiResponse<IPassengerDto>>(url).pipe(
      map(response => {
        logApiResponse(this.SERVICE_NAME, 'getSavedPassenger', response);
        if (response && response.data) {
          return response.data;
        }
        throw new Error('Passenger not found.');
      }),
      catchError(error => handleApiError(this.SERVICE_NAME, 'getSavedPassenger', error))
    );
  }

  updateSavedPassenger(passengerId: number, updateDto: IUpdatePassengerDto): Observable<IPassengerDto> {
    const url = `${this.customerBaseUrl}/passengers/${passengerId}`;
    logApiRequest(this.SERVICE_NAME, 'updateSavedPassenger', url, updateDto);

    return this.http.put<IApiResponse<IPassengerDto>>(url, updateDto).pipe(
      map(response => {
        logApiResponse(this.SERVICE_NAME, 'updateSavedPassenger', response);
        if (response && response.data) {
          return response.data;
        }
        throw new Error('Failed to update passenger. No data returned.');
      }),
      catchError(error => handleApiError(this.SERVICE_NAME, 'updateSavedPassenger', error))
    );
  }

  deleteSavedPassenger(passengerId: number): Observable<boolean> {
    const url = `${this.customerBaseUrl}/passengers/${passengerId}`;
    logApiRequest(this.SERVICE_NAME, 'deleteSavedPassenger', url, { passengerId });

    return this.http.delete<IApiResponse>(url).pipe(
      map(response => {
        logApiResponse(this.SERVICE_NAME, 'deleteSavedPassenger', response);
        if (response && response.statusCode === 200) {
          return true;
        }
        return false;
      }),
      catchError(error => handleApiError(this.SERVICE_NAME, 'deleteSavedPassenger', error))
    );
  }
}