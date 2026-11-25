import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

import { IApiResponse } from '../../models/api-response.model';
import { IPaginatedResult } from '../../models/paging.model';
import { logApiRequest, logApiResponse, handleApiError } from '../api-helpers';

import {
  IBookingDetailDto, IBookingFilterDto, IBookingDto, IUpdateBookingStatusDto, IBookingCancelDto,
  IPassengerFilterDto, IPassengerDto, IUpdatePassengerDto,
  ITicketFilterDto, ITicketDto, ITicketDetailDto, IUpdateTicketStatusDto
} from '../../models/booking-management.model';

@Injectable({
  providedIn: 'root'
})
export class BookingManagementService {
  private http = inject(HttpClient);
  private readonly SERVICE_NAME = 'BookingManagementService';
  private readonly baseUrl = `${environment.apiUrl}/v1/Admin/BookingManagement`;

  // --- Booking Endpoints ---

  getBookingDetails(bookingId: number): Observable<IBookingDetailDto> {
    const url = `${this.baseUrl}/bookings/${bookingId}/details`;
    logApiRequest(this.SERVICE_NAME, 'getBookingDetails', url);
    return this.http.get<IApiResponse<IBookingDetailDto>>(url).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'getBookingDetails', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'getBookingDetails', err))
    );
  }

  getBookingByReference(bookingReference: string): Observable<IBookingDetailDto> {
    const url = `${this.baseUrl}/bookings/by-reference/${bookingReference}`;
    logApiRequest(this.SERVICE_NAME, 'getBookingByReference', url);
    return this.http.get<IApiResponse<IBookingDetailDto>>(url).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'getBookingByReference', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'getBookingByReference', err))
    );
  }

  searchBookings(filter: IBookingFilterDto, pageNumber: number = 1, pageSize: number = 20): Observable<IPaginatedResult<IBookingDto>> {
    const url = `${this.baseUrl}/bookings/search`;
    let params = new HttpParams().set('pageNumber', pageNumber.toString()).set('pageSize', pageSize.toString());
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params = params.set(key, value.toString());
      }
    });

    logApiRequest(this.SERVICE_NAME, 'searchBookings', url, { filter, pageNumber, pageSize });
    return this.http.get<IApiResponse<IPaginatedResult<IBookingDto>>>(url, { params }).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'searchBookings', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'searchBookings', err))
    );
  }

  updateBookingStatus(bookingId: number, statusDto: IUpdateBookingStatusDto): Observable<void> {
    const url = `${this.baseUrl}/bookings/${bookingId}/status`;
    logApiRequest(this.SERVICE_NAME, 'updateBookingStatus', url, statusDto);
    return this.http.patch<IApiResponse<void>>(url, statusDto).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'updateBookingStatus', res); }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'updateBookingStatus', err))
    );
  }

  cancelBooking(bookingId: number, cancelDto: IBookingCancelDto): Observable<void> {
    const url = `${this.baseUrl}/bookings/${bookingId}/cancel`;
    logApiRequest(this.SERVICE_NAME, 'cancelBooking', url, cancelDto);
    return this.http.post<IApiResponse<void>>(url, cancelDto).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'cancelBooking', res); }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'cancelBooking', err))
    );
  }

  getPassengerManifest(flightInstanceId: number): Observable<any[]> {
    const url = `${this.baseUrl}/flights/${flightInstanceId}/manifest`;
    logApiRequest(this.SERVICE_NAME, 'getPassengerManifest', url);
    return this.http.get<IApiResponse<any[]>>(url).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'getPassengerManifest', res); return res?.data || []; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'getPassengerManifest', err))
    );
  }

  // --- Passenger Endpoints ---

  searchPassengers(filter: IPassengerFilterDto, pageNumber: number = 1, pageSize: number = 20): Observable<IPaginatedResult<IPassengerDto>> {
    const url = `${this.baseUrl}/passengers/search`;
    let params = new HttpParams().set('pageNumber', pageNumber.toString()).set('pageSize', pageSize.toString());
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params = params.set(key, value.toString());
      }
    });

    logApiRequest(this.SERVICE_NAME, 'searchPassengers', url, { filter, pageNumber, pageSize });
    return this.http.get<IApiResponse<IPaginatedResult<IPassengerDto>>>(url, { params }).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'searchPassengers', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'searchPassengers', err))
    );
  }

  getPassengerDetails(passengerId: number): Observable<IPassengerDto> {
    const url = `${this.baseUrl}/passengers/${passengerId}/details`;
    logApiRequest(this.SERVICE_NAME, 'getPassengerDetails', url);
    return this.http.get<IApiResponse<IPassengerDto>>(url).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'getPassengerDetails', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'getPassengerDetails', err))
    );
  }

  getPassengersForBooking(bookingId: number): Observable<IPassengerDto[]> {
    const url = `${this.baseUrl}/bookings/${bookingId}/passengers`;
    logApiRequest(this.SERVICE_NAME, 'getPassengersForBooking', url);
    return this.http.get<IApiResponse<IPassengerDto[]>>(url).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'getPassengersForBooking', res); return res?.data || []; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'getPassengersForBooking', err))
    );
  }

  getPassengersForUser(userId: number): Observable<IPassengerDto[]> {
    const url = `${this.baseUrl}/users/${userId}/passengers`;
    logApiRequest(this.SERVICE_NAME, 'getPassengersForUser', url);
    return this.http.get<IApiResponse<IPassengerDto[]>>(url).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'getPassengersForUser', res); return res?.data || []; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'getPassengersForUser', err))
    );
  }

  updatePassengerDetails(passengerId: number, updateDto: IUpdatePassengerDto): Observable<IPassengerDto> {
    const url = `${this.baseUrl}/passengers/${passengerId}`;
    logApiRequest(this.SERVICE_NAME, 'updatePassengerDetails', url, updateDto);
    return this.http.put<IApiResponse<IPassengerDto>>(url, updateDto).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'updatePassengerDetails', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'updatePassengerDetails', err))
    );
  }

  deletePassenger(passengerId: number): Observable<void> {
    const url = `${this.baseUrl}/passengers/${passengerId}`;
    logApiRequest(this.SERVICE_NAME, 'deletePassenger', url);
    return this.http.delete<IApiResponse<void>>(url).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'deletePassenger', res); }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'deletePassenger', err))
    );
  }

  // --- Ticket Endpoints ---

  searchTickets(filter: ITicketFilterDto, pageNumber: number = 1, pageSize: number = 20): Observable<IPaginatedResult<ITicketDto>> {
    const url = `${this.baseUrl}/tickets/search`;
    let params = new HttpParams().set('pageNumber', pageNumber.toString()).set('pageSize', pageSize.toString());
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params = params.set(key, value.toString());
      }
    });

    logApiRequest(this.SERVICE_NAME, 'searchTickets', url, { filter, pageNumber, pageSize });
    return this.http.get<IApiResponse<IPaginatedResult<ITicketDto>>>(url, { params }).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'searchTickets', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'searchTickets', err))
    );
  }

  getTicketDetails(ticketId: number): Observable<ITicketDetailDto> {
    const url = `${this.baseUrl}/tickets/${ticketId}/details`;
    logApiRequest(this.SERVICE_NAME, 'getTicketDetails', url);
    return this.http.get<IApiResponse<ITicketDetailDto>>(url).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'getTicketDetails', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'getTicketDetails', err))
    );
  }

  getTicketByCode(ticketCode: string): Observable<ITicketDetailDto> {
    const url = `${this.baseUrl}/tickets/by-code/${ticketCode}`;
    logApiRequest(this.SERVICE_NAME, 'getTicketByCode', url);
    return this.http.get<IApiResponse<ITicketDetailDto>>(url).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'getTicketByCode', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'getTicketByCode', err))
    );
  }

  getTicketsForBookingAdmin(bookingId: number): Observable<ITicketDto[]> {
    const url = `${this.baseUrl}/bookings/${bookingId}/tickets`;
    logApiRequest(this.SERVICE_NAME, 'getTicketsForBookingAdmin', url);
    return this.http.get<IApiResponse<ITicketDto[]>>(url).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'getTicketsForBookingAdmin', res); return res?.data || []; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'getTicketsForBookingAdmin', err))
    );
  }

  generateTickets(bookingId: number): Observable<any> {
    const url = `${this.baseUrl}/bookings/${bookingId}/generate-tickets`;
    logApiRequest(this.SERVICE_NAME, 'generateTickets', url);
    return this.http.post<IApiResponse<any>>(url, {}).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'generateTickets', res); return res?.data as any; }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'generateTickets', err))
    );
  }

  updateTicketStatus(ticketId: number, statusDto: IUpdateTicketStatusDto): Observable<void> {
    const url = `${this.baseUrl}/tickets/${ticketId}/status`;
    logApiRequest(this.SERVICE_NAME, 'updateTicketStatus', url, statusDto);
    return this.http.patch<IApiResponse<void>>(url, statusDto).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'updateTicketStatus', res); }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'updateTicketStatus', err))
    );
  }

  voidTicket(ticketId: number, cancelDto: IBookingCancelDto): Observable<void> {
    const url = `${this.baseUrl}/tickets/${ticketId}/void`;
    logApiRequest(this.SERVICE_NAME, 'voidTicket', url, cancelDto);
    return this.http.post<IApiResponse<void>>(url, cancelDto).pipe(
      map(res => { logApiResponse(this.SERVICE_NAME, 'voidTicket', res); }),
      catchError(err => handleApiError(this.SERVICE_NAME, 'voidTicket', err))
    );
  }
}
