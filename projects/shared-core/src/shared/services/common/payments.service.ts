import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

import { IApiResponse } from '../../../shared/models/api-response.model';
import { logApiRequest, logApiResponse, handleApiError } from '../api-helpers';

import {
  ICreatePaymentIntentRequest,
  IPaymentIntentResponse,
  ICreatePaymentRequest,
  IPaymentTransaction,
  IPaymentStatus,
  IPaymentFilter,
  IPaymentSearchResult,
  IRefundRequest,
  IRefundResult,
  IDailyRevenueStats
} from '../../models/payments.model';

/** Case-insensitive property lookup (camelCase / PascalCase / aliases). */
function pickField(raw: any, ...keys: string[]): any {
  if (!raw || typeof raw !== 'object') return undefined;
  for (const key of keys) {
    if (raw[key] !== undefined && raw[key] !== null) return raw[key];
  }
  const lowerMap = new Map<string, any>(
    Object.keys(raw).map(k => [k.toLowerCase(), (raw as Record<string, any>)[k]])
  );
  for (const key of keys) {
    const value = lowerMap.get(key.toLowerCase());
    if (value !== undefined && value !== null) return value;
  }
  return undefined;
}

/** Coerce array-like payloads (plain arrays, Newtonsoft `$values`, etc.). */
function asArray(value: any): any[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (Array.isArray(value.$values)) return value.$values;
  if (Array.isArray(value.values)) return value.values;
  return [];
}

/** Unwrap ApiResponse / alternate envelopes to the inner payload. */
function unwrapPayload(response: any): any {
  if (response == null) return null;
  if (Array.isArray(response)) return response;
  const nested = pickField(response, 'data', 'Data', 'result', 'Result', 'payload', 'Payload');
  return nested !== undefined ? nested : response;
}

/** Extract the transaction list from a paged or raw payload. */
function extractTransactionList(payload: any): any[] {
  if (payload == null) return [];
  if (Array.isArray(payload)) return payload;
  const list = pickField(
    payload,
    'items', 'Items',
    'data', 'Data',
    'results', 'Results',
    'payments', 'Payments',
    'records', 'Records',
    'transactions', 'Transactions',
    'value', 'Value',
    'list', 'List',
    'content', 'Content'
  );
  return asArray(list);
}

export function normalizePaymentTransaction(raw: any): IPaymentTransaction {
  if (!raw) return {} as IPaymentTransaction;

  const paymentId = Number(pickField(raw, 'paymentId', 'PaymentId', 'id', 'Id') ?? 0);
  const bookingId = Number(pickField(raw, 'bookingId', 'BookingId') ?? 0);
  const statusRaw = pickField(raw, 'status', 'Status') ?? 'Pending';
  const statusStr = String(statusRaw);
  const isRefunded = Boolean(
    pickField(raw, 'isRefunded', 'IsRefunded') ??
    (statusStr.toLowerCase() === 'refunded')
  );
  const method = String(
    pickField(raw, 'method', 'Method', 'paymentMethod', 'PaymentMethod') ?? 'Card'
  );
  const date = String(
    pickField(
      raw,
      'transactionDateTime', 'TransactionDateTime',
      'transactionDate', 'TransactionDate',
      'createdAt', 'CreatedAt',
      'timestamp', 'Timestamp'
    ) ?? new Date().toISOString()
  );
  const bookingRef =
    pickField(raw, 'bookingReference', 'BookingReference', 'bookingRef', 'BookingRef') ??
    (bookingId ? `ASPR-${bookingId}` : '');
  const transactionId = String(
    pickField(
      raw,
      'transactionId', 'TransactionId',
      'gatewayReference', 'GatewayReference',
      'txId', 'TxId'
    ) ?? `TX-${paymentId}`
  );

  return {
    paymentId,
    bookingId,
    bookingReference: String(bookingRef),
    transactionId,
    amount: Number(pickField(raw, 'amount', 'Amount') ?? 0),
    currency: String(pickField(raw, 'currency', 'Currency') ?? 'SGD'),
    paymentMethod: method,
    method,
    status: statusStr,
    transactionDate: date,
    transactionDateTime: date,
    isRefunded,
  };
}

function extractSearchResult(
  response: any,
  pageNumber: number,
  pageSize: number
): IPaymentSearchResult {
  if (!response) {
    return { items: [], totalCount: 0, totalPages: 0, pageNumber, pageSize };
  }

  const payload = unwrapPayload(response);
  const rawList = extractTransactionList(payload);
  const metaSource =
    payload && typeof payload === 'object' && !Array.isArray(payload) ? payload : response;

  const totalCount = Number(
    pickField(metaSource, 'totalCount', 'TotalCount', 'total', 'Total') ?? rawList.length
  );
  const pSize = Number(
    pickField(metaSource, 'pageSize', 'PageSize') ?? pageSize
  ) || pageSize;
  const pNumber = Number(
    pickField(metaSource, 'pageNumber', 'PageNumber', 'currentPage', 'CurrentPage') ?? pageNumber
  ) || pageNumber;
  const totalPages = Number(
    pickField(metaSource, 'totalPages', 'TotalPages') ??
    Math.max(rawList.length > 0 ? 1 : 0, Math.ceil(totalCount / pSize))
  );

  const items = rawList.map(item => normalizePaymentTransaction(item));

  return {
    items,
    totalCount: totalCount || items.length,
    totalPages: totalPages || (items.length > 0 ? 1 : 0),
    pageNumber: pNumber,
    pageSize: pSize,
  };
}

@Injectable({
  providedIn: 'root'
})
export class PaymentsService {

  private http = inject(HttpClient);
  private readonly SERVICE_NAME = 'PaymentsService';
  private readonly customerBaseUrl = `${environment.apiUrl}/v1/payments`;
  private readonly adminBaseUrl = `${environment.apiUrl}/v1/payments/admin`;

  constructor() { }

  createPaymentIntent(request: ICreatePaymentIntentRequest): Observable<IPaymentIntentResponse> {
    const url = `${this.customerBaseUrl}/intent`;
    logApiRequest(this.SERVICE_NAME, 'createPaymentIntent', url, request);

    return this.http.post<IApiResponse<IPaymentIntentResponse>>(url, request).pipe(
      map(response => {
        logApiResponse(this.SERVICE_NAME, 'createPaymentIntent', response);
        const data = unwrapPayload(response);
        if (data) return data as IPaymentIntentResponse;
        throw new Error('API executed successfully but returned no data payload.');
      }),
      catchError(error => handleApiError(this.SERVICE_NAME, 'createPaymentIntent', error))
    );
  }

  confirmPayment(request: ICreatePaymentRequest): Observable<IPaymentTransaction> {
    const url = `${this.customerBaseUrl}/confirm`;
    logApiRequest(this.SERVICE_NAME, 'confirmPayment', url, request);

    return this.http.post<any>(url, request).pipe(
      map(response => {
        logApiResponse(this.SERVICE_NAME, 'confirmPayment', response);
        const data = unwrapPayload(response);
        if (data) return normalizePaymentTransaction(data);
        throw new Error('API executed successfully but returned no data payload.');
      }),
      catchError(error => handleApiError(this.SERVICE_NAME, 'confirmPayment', error))
    );
  }

  getPaymentStatus(bookingId: number): Observable<IPaymentStatus> {
    const url = `${this.customerBaseUrl}/status/${bookingId}`;
    logApiRequest(this.SERVICE_NAME, 'getPaymentStatus', url, { bookingId });

    return this.http.get<IApiResponse<IPaymentStatus>>(url).pipe(
      map(response => {
        logApiResponse(this.SERVICE_NAME, 'getPaymentStatus', response);
        const data = unwrapPayload(response);
        if (data) return data as IPaymentStatus;
        throw new Error('API executed successfully but returned no data payload.');
      }),
      catchError(error => handleApiError(this.SERVICE_NAME, 'getPaymentStatus', error))
    );
  }

  searchPayments(
    filter: IPaymentFilter,
    pageNumber: number = 1,
    pageSize: number = 20
  ): Observable<IPaymentSearchResult> {
    const url = `${this.adminBaseUrl}/search`;
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    if (filter.bookingId) params = params.set('bookingId', filter.bookingId.toString());
    if (filter.minAmount != null) params = params.set('minAmount', filter.minAmount.toString());
    if (filter.maxAmount != null) params = params.set('maxAmount', filter.maxAmount.toString());
    if (filter.startDate) params = params.set('startDate', filter.startDate);
    if (filter.endDate) params = params.set('endDate', filter.endDate);
    if (filter.status) params = params.set('status', filter.status);
    if (filter.paymentMethod) params = params.set('paymentMethod', filter.paymentMethod);

    logApiRequest(this.SERVICE_NAME, 'searchPayments', url, { filter, pageNumber, pageSize });

    return this.http.get<any>(url, { params }).pipe(
      map((response: any) => {
        logApiResponse(this.SERVICE_NAME, 'searchPayments', response);
        return extractSearchResult(response, pageNumber, pageSize);
      }),
      catchError(error => handleApiError(this.SERVICE_NAME, 'searchPayments', error))
    );
  }

  processRefund(request: IRefundRequest): Observable<IRefundResult> {
    const url = `${this.adminBaseUrl}/refund`;
    logApiRequest(this.SERVICE_NAME, 'processRefund', url, request);

    return this.http.post<IApiResponse<IRefundResult>>(url, request).pipe(
      map(response => {
        logApiResponse(this.SERVICE_NAME, 'processRefund', response);
        const data = unwrapPayload(response);
        if (data) return data as IRefundResult;
        throw new Error('API executed successfully but returned no data payload.');
      }),
      catchError(error => handleApiError(this.SERVICE_NAME, 'processRefund', error))
    );
  }

  getDailyRevenue(date: string): Observable<IDailyRevenueStats> {
    const url = `${this.adminBaseUrl}/daily-revenue`;
    const params = new HttpParams().set('date', date);

    logApiRequest(this.SERVICE_NAME, 'getDailyRevenue', url, { date });

    return this.http.get<IApiResponse<IDailyRevenueStats>>(url, { params }).pipe(
      map(response => {
        logApiResponse(this.SERVICE_NAME, 'getDailyRevenue', response);
        const data = unwrapPayload(response);
        if (data) {
          return {
            date: String(pickField(data, 'date', 'Date') ?? date),
            totalRevenue: Number(pickField(data, 'totalRevenue', 'TotalRevenue') ?? 0),
            transactionCount: Number(pickField(data, 'transactionCount', 'TransactionCount') ?? 0),
            currency: String(pickField(data, 'currency', 'Currency') ?? 'SGD'),
          } as IDailyRevenueStats;
        }
        throw new Error('API executed successfully but returned no data payload.');
      }),
      catchError(error => handleApiError(this.SERVICE_NAME, 'getDailyRevenue', error))
    );
  }
}
