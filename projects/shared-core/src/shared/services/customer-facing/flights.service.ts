import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

import { IApiResponse } from '../../../shared/models/api-response.model';
import { logApiRequest, logApiResponse, handleApiError } from '../api-helpers';

import {
  IFlightSearchRequestDto,
  IFlightItineraryDto,
  IFlightDetailsDto,
  IFlightFareOptionDto,
  IFlightStatusRequestDto,
  IFlightSegmentDto
} from '../../models/flight.model';
import { IFareBasisCodeDto } from '../../models/fare-basis-code.model';

@Injectable({
  providedIn: 'root'
})
export class FlightsService {

  private http = inject(HttpClient);
  private readonly SERVICE_NAME = 'FlightsService';
  private readonly customerBaseUrl = `${environment.apiUrl}/v1/Flights`;

  constructor() { }

  searchFlights(searchRequest: IFlightSearchRequestDto): Observable<IFlightItineraryDto[]> {
    const url = `${this.customerBaseUrl}/search`;
    logApiRequest(this.SERVICE_NAME, 'searchFlights', url, searchRequest);

    return this.http.post<IApiResponse<IFlightItineraryDto[]>>(url, searchRequest).pipe(
      map(response => {
        logApiResponse(this.SERVICE_NAME, 'searchFlights', response);
        if (response && response.statusCode === 200 && response.data) {
          return response.data;
        }
        if (response && response.statusCode === 200 && !response.data) {
          return [];
        }
        throw new Error(`Flight Search failed. Status: ${response?.statusCode}, Message: ${response?.message}`);
      }),
      catchError(error => handleApiError(this.SERVICE_NAME, 'searchFlights', error))
    );
  }

  getFlightDetails(flightInstanceId: number): Observable<IFlightDetailsDto> {
    const url = `${this.customerBaseUrl}/${flightInstanceId}/details`;
    logApiRequest(this.SERVICE_NAME, 'getFlightDetails', url, { flightInstanceId });

    return this.http.get<IApiResponse<IFlightDetailsDto>>(url).pipe(
      map(response => {
        logApiResponse(this.SERVICE_NAME, 'getFlightDetails', response);
        if (response && response.data) {
          return response.data;
        }
        throw new Error('Flight details not found in server response.');
      }),
      catchError(error => handleApiError(this.SERVICE_NAME, 'getFlightDetails', error))
    );
  }

  getFareOptions(flightInstanceId: number, passengers: number = 1): Observable<IFlightFareOptionDto[]> {
    const url = `${this.customerBaseUrl}/${flightInstanceId}/fares`;
    const params = new HttpParams().set('passengers', passengers.toString());

    logApiRequest(this.SERVICE_NAME, 'getFareOptions', url, { flightInstanceId, passengers });

    return this.http.get<IApiResponse<IFlightFareOptionDto[]>>(url, { params }).pipe(
      map(response => {
        logApiResponse(this.SERVICE_NAME, 'getFareOptions', response);
        if (response && response.data) {
          return response.data;
        }
        throw new Error('No fare options returned from server.');
      }),
      catchError(error => handleApiError(this.SERVICE_NAME, 'getFareOptions', error))
    );
  }

  getFlightStatus(statusRequest: IFlightStatusRequestDto): Observable<IFlightSegmentDto> {
    const url = `${this.customerBaseUrl}/status`;
    logApiRequest(this.SERVICE_NAME, 'getFlightStatus', url, statusRequest);

    return this.http.post<IApiResponse<IFlightSegmentDto>>(url, statusRequest).pipe(
      map(response => {
        logApiResponse(this.SERVICE_NAME, 'getFlightStatus', response);
        if (response && response.data) {
          return response.data;
        }
        throw new Error('Flight status information not found.');
      }),
      catchError(error => handleApiError(this.SERVICE_NAME, 'getFlightStatus', error))
    );
  }

  checkFlightAvailability(flightInstanceId: number, passengers: number = 1): Observable<boolean> {
    const url = `${this.customerBaseUrl}/${flightInstanceId}/check-availability`;
    const params = new HttpParams().set('passengers', passengers.toString());

    logApiRequest(this.SERVICE_NAME, 'checkFlightAvailability', url, { flightInstanceId, passengers });

    return this.http.get<IApiResponse<boolean>>(url, { params }).pipe(
      map(response => {
        logApiResponse(this.SERVICE_NAME, 'checkFlightAvailability', response);
        if (response && typeof response.data === 'boolean') {
          return response.data;
        }
        if (response && response.statusCode === 200) {
          return true;
        }
        throw new Error('Availability check returned invalid data format.');
      }),
      catchError(error => handleApiError(this.SERVICE_NAME, 'checkFlightAvailability', error))
    );
  }

  getFareRulesByCode(code: string): Observable<IFareBasisCodeDto> {
    const url = `${this.customerBaseUrl}/fares/${code}`;
    logApiRequest(this.SERVICE_NAME, 'getFareRulesByCode', url, { code });

    return this.http.get<IApiResponse<IFareBasisCodeDto>>(url).pipe(
      map(response => {
        logApiResponse(this.SERVICE_NAME, 'getFareRulesByCode', response);
        if (response && response.data) {
          return response.data;
        }
        throw new Error(`Fare rules for code '${code}' not found.`);
      }),
      catchError(error => handleApiError(this.SERVICE_NAME, 'getFareRulesByCode', error))
    );
  }

  getAllActiveFares(): Observable<IFareBasisCodeDto[]> {
    const url = `${this.customerBaseUrl}/fares/all-active`;
    logApiRequest(this.SERVICE_NAME, 'getAllActiveFares', url);

    return this.http.get<IApiResponse<IFareBasisCodeDto[]>>(url).pipe(
      map(response => {
        logApiResponse(this.SERVICE_NAME, 'getAllActiveFares', response);
        if (response && response.data) {
          return response.data;
        }
        return [];
      }),
      catchError(error => handleApiError(this.SERVICE_NAME, 'getAllActiveFares', error))
    );
  }
}