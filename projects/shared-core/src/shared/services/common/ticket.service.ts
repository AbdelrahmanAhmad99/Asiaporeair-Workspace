import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

import { IApiResponse } from '../../../shared/models/api-response.model';
import { logApiRequest, logApiResponse, handleApiError } from '../api-helpers';

import {
  ITicketDto,
  ITicketDetailDto,
  ITicketFilter,
  IUpdateTicketStatusRequest,
  IVoidTicketRequest,
  ITicketPaginatedResponse
} from '../../models/ticket.model';

@Injectable({
  providedIn: 'root'
})
export class TicketService {

  private http = inject(HttpClient);
  private readonly SERVICE_NAME = 'TicketService';
  private readonly customerBaseUrl = `${environment.apiUrl}/v1/Ticket`;
  private readonly adminBaseUrl = `${environment.apiUrl}/v1/Ticket/admin`;

  constructor() { }

  getMyTickets(pageNumber: number = 1, pageSize: number = 10): Observable<ITicketPaginatedResponse> {
    const url = `${this.customerBaseUrl}/my-tickets`;
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    logApiRequest(this.SERVICE_NAME, 'getMyTickets', url, { pageNumber, pageSize });

    return this.http.get<IApiResponse<ITicketPaginatedResponse>>(url, { params }).pipe(
      map(response => {
        logApiResponse(this.SERVICE_NAME, 'getMyTickets', response);
        if (response && response.data) {
          return response.data;
        }
        return { items: [], totalCount: 0, pageNumber, pageSize, totalPages: 0, hasPreviousPage: false, hasNextPage: false };
      }),
      catchError(error => handleApiError(this.SERVICE_NAME, 'getMyTickets', error))
    );
  }

  getTicketsForBooking(bookingId: number): Observable<ITicketDto[]> {
    const url = `${this.customerBaseUrl}/booking/${bookingId}`;
    logApiRequest(this.SERVICE_NAME, 'getTicketsForBooking', url, { bookingId });

    return this.http.get<IApiResponse<ITicketDto[]>>(url).pipe(
      map(response => {
        logApiResponse(this.SERVICE_NAME, 'getTicketsForBooking', response);
        if (response && response.data) {
          return response.data;
        }
        return [];
      }),
      catchError(error => handleApiError(this.SERVICE_NAME, 'getTicketsForBooking', error))
    );
  }

  getTicketDetails(ticketId: number): Observable<ITicketDetailDto> {
    const url = `${this.customerBaseUrl}/${ticketId}`;
    logApiRequest(this.SERVICE_NAME, 'getTicketDetails', url, { ticketId });

    return this.http.get<IApiResponse<ITicketDetailDto>>(url).pipe(
      map(response => {
        logApiResponse(this.SERVICE_NAME, 'getTicketDetails', response);
        if (response && response.data) {
          return response.data;
        }
        throw new Error('Ticket details not found in server response.');
      }),
      catchError(error => handleApiError(this.SERVICE_NAME, 'getTicketDetails', error))
    );
  }

  getTicketDetailsByCode(ticketCode: string): Observable<ITicketDetailDto> {
    const url = `${this.customerBaseUrl}/by-code/${ticketCode}`;
    logApiRequest(this.SERVICE_NAME, 'getTicketDetailsByCode', url, { ticketCode });

    return this.http.get<IApiResponse<ITicketDetailDto>>(url).pipe(
      map(response => {
        logApiResponse(this.SERVICE_NAME, 'getTicketDetailsByCode', response);
        if (response && response.data) {
          return response.data;
        }
        throw new Error(`Ticket code '${ticketCode}' details not found.`);
      }),
      catchError(error => handleApiError(this.SERVICE_NAME, 'getTicketDetailsByCode', error))
    );
  }

  searchTickets(filter: ITicketFilter, pageNumber: number = 1, pageSize: number = 10): Observable<ITicketPaginatedResponse> {
    const url = `${this.adminBaseUrl}/search`;
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    if (filter.ticketCode) params = params.set('ticketCode', filter.ticketCode);
    if (filter.bookingId) params = params.set('bookingId', filter.bookingId.toString());
    if (filter.bookingReference) params = params.set('bookingReference', filter.bookingReference);
    if (filter.flightInstanceId) params = params.set('flightInstanceId', filter.flightInstanceId.toString());
    if (filter.passengerNameContains) params = params.set('passengerNameContains', filter.passengerNameContains);
    if (filter.passengerPassport) params = params.set('passengerPassport', filter.passengerPassport);
    if (filter.status) params = params.set('status', filter.status);
    if (filter.issueDateFrom) params = params.set('issueDateFrom', filter.issueDateFrom);
    if (filter.issueDateTo) params = params.set('issueDateTo', filter.issueDateTo);
    if (filter.includeDeleted !== undefined) params = params.set('includeDeleted', filter.includeDeleted.toString());

    logApiRequest(this.SERVICE_NAME, 'searchTickets', url, { filter, pageNumber, pageSize });

    return this.http.get<IApiResponse<ITicketPaginatedResponse>>(url, { params }).pipe(
      map(response => {
        logApiResponse(this.SERVICE_NAME, 'searchTickets', response);
        if (response && response.data) {
          return response.data;
        }
        return { items: [], totalCount: 0, pageNumber, pageSize, totalPages: 0, hasPreviousPage: false, hasNextPage: false };
      }),
      catchError(error => handleApiError(this.SERVICE_NAME, 'searchTickets', error))
    );
  }

  getTicketsForUser(userId: string): Observable<ITicketDto[]> {
    const url = `${this.adminBaseUrl}/user/${userId}`;
    logApiRequest(this.SERVICE_NAME, 'getTicketsForUser', url, { userId });

    return this.http.get<IApiResponse<ITicketDto[]>>(url).pipe(
      map(response => {
        logApiResponse(this.SERVICE_NAME, 'getTicketsForUser', response);
        if (response && response.data) {
          return response.data;
        }
        return [];
      }),
      catchError(error => handleApiError(this.SERVICE_NAME, 'getTicketsForUser', error))
    );
  }

  updateTicketStatus(ticketId: number, updateDto: IUpdateTicketStatusRequest): Observable<boolean> {
    const url = `${this.adminBaseUrl}/status/${ticketId}`;
    logApiRequest(this.SERVICE_NAME, 'updateTicketStatus', url, updateDto);

    return this.http.put<IApiResponse>(url, updateDto).pipe(
      map(response => {
        logApiResponse(this.SERVICE_NAME, 'updateTicketStatus', response);
        if (response && response.statusCode === 200) {
          return true;
        }
        return false;
      }),
      catchError(error => handleApiError(this.SERVICE_NAME, 'updateTicketStatus', error))
    );
  }

  voidTicket(ticketId: number, voidDto: IVoidTicketRequest): Observable<boolean> {
    const url = `${this.adminBaseUrl}/void/${ticketId}`;
    logApiRequest(this.SERVICE_NAME, 'voidTicket', url, voidDto);

    return this.http.put<IApiResponse>(url, voidDto).pipe(
      map(response => {
        logApiResponse(this.SERVICE_NAME, 'voidTicket', response);
        if (response && response.statusCode === 200) {
          return true;
        }
        return false;
      }),
      catchError(error => handleApiError(this.SERVICE_NAME, 'voidTicket', error))
    );
  }
}