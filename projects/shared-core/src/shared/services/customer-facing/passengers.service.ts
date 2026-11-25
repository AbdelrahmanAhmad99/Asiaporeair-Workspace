import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

import { IApiResponse } from '../../models/api-response.model';
import { logApiRequest, logApiResponse, handleApiError } from '../api-helpers';

import {
  IPassengerDto,
  IUpdatePassengerDto
} from '../../models/passenger.model';

@Injectable({
  providedIn: 'root'
})
export class PassengersService {

  private http = inject(HttpClient);
  private readonly SERVICE_NAME = 'PassengersService';
  private readonly customerBaseUrl = `${environment.apiUrl}/v1/Passengers`;

  constructor() { }

  getMySavedPassengers(): Observable<IPassengerDto[]> {
    const url = `${this.customerBaseUrl}/my-passengers`;
    logApiRequest(this.SERVICE_NAME, 'getMySavedPassengers', url);

    return this.http.get<IApiResponse<IPassengerDto[]>>(url).pipe(
      map(response => {
        logApiResponse(this.SERVICE_NAME, 'getMySavedPassengers', response);
        if (response && response.statusCode === 200 && response.data) {
          return response.data;
        }
        if (response && response.statusCode === 200 && !response.data) {
          return [];
        }
        throw new Error(`Failed to retrieve passengers. Status: ${response?.statusCode}`);
      }),
      catchError(error => handleApiError(this.SERVICE_NAME, 'getMySavedPassengers', error))
    );
  }

  getSavedPassenger(passengerId: number): Observable<IPassengerDto> {
    const url = `${this.customerBaseUrl}/${passengerId}`;
    logApiRequest(this.SERVICE_NAME, 'getSavedPassenger', url, { passengerId });

    return this.http.get<IApiResponse<IPassengerDto>>(url).pipe(
      map(response => {
        logApiResponse(this.SERVICE_NAME, 'getSavedPassenger', response);
        if (response && response.statusCode === 200 && response.data) {
          return response.data;
        }
        throw new Error('Passenger details not found in server response.');
      }),
      catchError(error => handleApiError(this.SERVICE_NAME, 'getSavedPassenger', error))
    );
  }

  updateSavedPassenger(passengerId: number, updateDto: IUpdatePassengerDto): Observable<IPassengerDto> {
    const url = `${this.customerBaseUrl}/${passengerId}`;
    logApiRequest(this.SERVICE_NAME, 'updateSavedPassenger', url, updateDto);

    return this.http.put<IApiResponse<IPassengerDto>>(url, updateDto).pipe(
      map(response => {
        logApiResponse(this.SERVICE_NAME, 'updateSavedPassenger', response);
        if (response && response.statusCode === 200 && response.data) {
          return response.data;
        }
        throw new Error('Failed to update passenger. No data returned.');
      }),
      catchError(error => handleApiError(this.SERVICE_NAME, 'updateSavedPassenger', error))
    );
  }

  deleteSavedPassenger(passengerId: number): Observable<boolean> {
    const url = `${this.customerBaseUrl}/${passengerId}`;
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