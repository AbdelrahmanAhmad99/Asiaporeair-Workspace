import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

import { IApiResponse } from '../../models/api-response.model';
import { logApiRequest, logApiResponse, handleApiError } from '../api-helpers';

import {
  ISeatMapDto,
  ISeatDto,
  ISeatAvailabilityRequestDto,
  ISeatAssignmentDto,
  IAssignSeatRequestDto,
  IReserveSeatDto
} from '../../models/seat.model';

@Injectable({
  providedIn: 'root'
})
export class SeatService {

  private http = inject(HttpClient);
  private readonly SERVICE_NAME = 'SeatService';
  private readonly customerBaseUrl = `${environment.apiUrl}/v1/Seats`;

  constructor() { }

  getSeatMapForFlight(flightInstanceId: number): Observable<ISeatMapDto> {
    const url = `${this.customerBaseUrl}/flight/${flightInstanceId}/seatmap`;
    logApiRequest(this.SERVICE_NAME, 'getSeatMapForFlight', url, { flightInstanceId });

    return this.http.get<IApiResponse<ISeatMapDto>>(url).pipe(
      map(response => {
        logApiResponse(this.SERVICE_NAME, 'getSeatMapForFlight', response);
        if (response && response.statusCode === 200 && response.data) {
          return response.data;
        }
        throw new Error(`Failed to retrieve seat map. Status: ${response?.statusCode}, Message: ${response?.message}`);
      }),
      catchError(error => handleApiError(this.SERVICE_NAME, 'getSeatMapForFlight', error))
    );
  }

  getAvailableSeats(request: ISeatAvailabilityRequestDto): Observable<ISeatDto[]> {
    const url = `${this.customerBaseUrl}/flight/available-seats`;
    let params = new HttpParams().set('FlightInstanceId', request.flightInstanceId.toString());
    if (request.cabinClassId != null) {
      params = params.set('CabinClassId', request.cabinClassId.toString());
    }

    logApiRequest(this.SERVICE_NAME, 'getAvailableSeats', url, request);

    return this.http.get<IApiResponse<ISeatDto[]>>(url, { params }).pipe(
      map(response => {
        logApiResponse(this.SERVICE_NAME, 'getAvailableSeats', response);
        if (response && response.statusCode === 200 && response.data) {
          return response.data;
        }
        if (response && response.statusCode === 200 && !response.data) {
          return [];
        }
        throw new Error('Failed to retrieve available seats.');
      }),
      catchError(error => handleApiError(this.SERVICE_NAME, 'getAvailableSeats', error))
    );
  }

  getSeatAssignmentsForBooking(bookingId: number): Observable<ISeatAssignmentDto[]> {
    const url = `${this.customerBaseUrl}/booking/${bookingId}/assignments`;
    logApiRequest(this.SERVICE_NAME, 'getSeatAssignmentsForBooking', url, { bookingId });

    return this.http.get<IApiResponse<ISeatAssignmentDto[]>>(url).pipe(
      map(response => {
        logApiResponse(this.SERVICE_NAME, 'getSeatAssignmentsForBooking', response);
        if (response && response.statusCode === 200 && response.data) {
          return response.data;
        }
        if (response && response.statusCode === 200 && !response.data) {
          return [];
        }
        throw new Error('Failed to retrieve seat assignments.');
      }),
      catchError(error => handleApiError(this.SERVICE_NAME, 'getSeatAssignmentsForBooking', error))
    );
  }

  assignSeat(request: IAssignSeatRequestDto): Observable<boolean> {
    const url = `${this.customerBaseUrl}/assign-seat`;
    logApiRequest(this.SERVICE_NAME, 'assignSeat', url, request);

    return this.http.post<IApiResponse>(url, request).pipe(
      map(response => {
        logApiResponse(this.SERVICE_NAME, 'assignSeat', response);
        if (response && response.statusCode === 200) {
          return true;
        }
        throw new Error(response?.message || 'Seat assignment failed.');
      }),
      catchError(error => handleApiError(this.SERVICE_NAME, 'assignSeat', error))
    );
  }

  reserveSeats(bookingId: number, reservesDto: IReserveSeatDto[]): Observable<ISeatDto[]> {
    const url = `${this.customerBaseUrl}/booking/${bookingId}/reserve-seats`;
    logApiRequest(this.SERVICE_NAME, 'reserveSeats', url, { bookingId, count: reservesDto.length });

    return this.http.post<IApiResponse<ISeatDto[]>>(url, reservesDto).pipe(
      map(response => {
        logApiResponse(this.SERVICE_NAME, 'reserveSeats', response);
        if (response && response.statusCode === 200 && response.data) {
          return response.data;
        }
        throw new Error('Seat reservation failed.');
      }),
      catchError(error => handleApiError(this.SERVICE_NAME, 'reserveSeats', error))
    );
  }

  removeSeatAssignment(bookingId: number, passengerId: number): Observable<boolean> {
    const url = `${this.customerBaseUrl}/booking/${bookingId}/passenger/${passengerId}/remove-seat`;
    logApiRequest(this.SERVICE_NAME, 'removeSeatAssignment', url, { bookingId, passengerId });

    return this.http.delete<IApiResponse>(url).pipe(
      map(response => {
        logApiResponse(this.SERVICE_NAME, 'removeSeatAssignment', response);
        if (response && response.statusCode === 200) {
          return true;
        }
        return false;
      }),
      catchError(error => handleApiError(this.SERVICE_NAME, 'removeSeatAssignment', error))
    );
  }
}