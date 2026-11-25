// src/app/shared/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';

// --- Core Services & Models ---
import { IApiResponse } from '../../models/api-response.model';
import { logApiRequest, logApiResponse, handleApiError } from '../api-helpers';

// --- Domain Models & DTOs ---
import {
  SuperAdminDto, AdminDto, SupervisorDto, PilotDto, AttendantDto,
  UpdatePilotProfileDto, UpdateAdminProfileDto, UpdateSuperAdminProfileDto,
  UpdateSupervisorProfileDto, UpdateAttendantProfileDto,
  AnyUserProfileDto, SuperAdminProfileDto,
  AdminProfileDto, PilotProfileDto, AttendantProfileDto, SupervisorProfileDto
} from '../../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // Base API URLs based on Controller structure
  private readonly SERVICE_NAME = 'AuthService';
  private readonly customerBaseUrl = `${environment.apiUrl}/Auth`;
  private readonly adminBaseUrl = `${environment.apiUrl}/Auth`;

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }


  // ==========================================================================
  // 3. Registration (Using FormData for Profile Pictures)
  // ==========================================================================

  /**
   * Registers the initial SuperAdmin (Public/Bootstrapping).
   * Path: POST /api/v1/Auth/register-superadmin
   */
  registerSuperAdmin(dto: SuperAdminDto): Observable<string> {
    const url = `${this.customerBaseUrl}/register-superadmin`;
    const formData = this.createFormData(dto);
    logApiRequest(this.SERVICE_NAME, 'registerSuperAdmin', url, dto);
    return this.http.post<IApiResponse>(url, formData)
      .pipe(
        map(res => { logApiResponse(this.SERVICE_NAME, 'registerSuperAdmin', res); return res.message || 'SuperAdmin registered.'; }),
        catchError(err => handleApiError(this.SERVICE_NAME, 'registerSuperAdmin', err))
      );
  }

  /**
   * Registers a new Admin.
   * Path: POST /api/v1/Auth/admin/register-admin
   */
  registerAdmin(dto: AdminDto): Observable<string> {
    const url = `${this.adminBaseUrl}/register-admin`;
    const formData = this.createFormData(dto);
    logApiRequest(this.SERVICE_NAME, 'registerAdmin', url, dto);
    return this.http.post<IApiResponse>(url, formData)
      .pipe(
        map(res => { logApiResponse(this.SERVICE_NAME, 'registerAdmin', res); return res.message || 'Admin registered.'; }),
        catchError(err => handleApiError(this.SERVICE_NAME, 'registerAdmin', err))
      );
  }

  /**
   * Registers a new Supervisor.
   * Path: POST /api/v1/Auth/admin/register-supervisor
   */
  registerSupervisor(dto: SupervisorDto): Observable<string> {
    const url = `${this.adminBaseUrl}/register-supervisor`;
    const formData = this.createFormData(dto);
    logApiRequest(this.SERVICE_NAME, 'registerSupervisor', url, dto);
    return this.http.post<IApiResponse>(url, formData)
      .pipe(
        map(res => { logApiResponse(this.SERVICE_NAME, 'registerSupervisor', res); return res.message || 'Supervisor registered.'; }),
        catchError(err => handleApiError(this.SERVICE_NAME, 'registerSupervisor', err))
      );
  }

  /**
   * Registers a new Pilot.
   * Path: POST /api/v1/Auth/admin/register-pilot
   */
  registerPilot(dto: PilotDto): Observable<string> {
    const url = `${this.adminBaseUrl}/register-pilot`;
    const formData = this.createFormData(dto);
    logApiRequest(this.SERVICE_NAME, 'registerPilot', url, dto);
    return this.http.post<IApiResponse>(url, formData)
      .pipe(
        map(res => { logApiResponse(this.SERVICE_NAME, 'registerPilot', res); return res.message || 'Pilot registered.'; }),
        catchError(err => handleApiError(this.SERVICE_NAME, 'registerPilot', err))
      );
  }

  /**
   * Registers a new Attendant.
   * Path: POST /api/v1/Auth/admin/register-attendant
   */
  registerAttendant(dto: AttendantDto): Observable<string> {
    const url = `${this.adminBaseUrl}/register-attendant`;
    const formData = this.createFormData(dto);
    logApiRequest(this.SERVICE_NAME, 'registerAttendant', url, dto);
    return this.http.post<IApiResponse>(url, formData)
      .pipe(
        map(res => { logApiResponse(this.SERVICE_NAME, 'registerAttendant', res); return res.message || 'Attendant registered.'; }),
        catchError(err => handleApiError(this.SERVICE_NAME, 'registerAttendant', err))
      );
  }

  // ==========================================================================
  // 4. Profile Updates (Using FormData)
  // ==========================================================================

  /**
   * Updates the authenticated SuperAdmin's own profile.
   * Path: PUT /api/v1/Auth/profile/superadmin
   */
  updateSuperAdminProfile(dto: UpdateSuperAdminProfileDto): Observable<string> {
    const url = `${this.customerBaseUrl}/profile/superadmin`;
    const formData = this.createFormData(dto);
    logApiRequest(this.SERVICE_NAME, 'updateSuperAdminProfile', url, dto);
    return this.http.put<IApiResponse>(url, formData)
      .pipe(
        map(res => { logApiResponse(this.SERVICE_NAME, 'updateSuperAdminProfile', res); return res.message || 'Profile updated.'; }),
        catchError(err => handleApiError(this.SERVICE_NAME, 'updateSuperAdminProfile', err))
      );
  }

  /**
   * Updates a specific Admin's profile by ID.
   * Path: PUT /api/v1/Auth/admin/profile/admin/{id}
   */
  updateAdminProfile(adminId: string, dto: UpdateAdminProfileDto): Observable<string> {
    const url = `${this.adminBaseUrl}/profile/admin/${adminId}`;
    const formData = this.createFormData(dto);
    logApiRequest(this.SERVICE_NAME, 'updateAdminProfile', url, dto);
    return this.http.put<IApiResponse>(url, formData)
      .pipe(
        map(res => { logApiResponse(this.SERVICE_NAME, 'updateAdminProfile', res); return res.message || 'Profile updated.'; }),
        catchError(err => handleApiError(this.SERVICE_NAME, 'updateAdminProfile', err))
      );
  }

  /**
   * Updates a specific Pilot's profile by ID.
   * Path: PUT /api/v1/Auth/admin/profile/pilot/{id}
   */
  updatePilotProfile(pilotId: string, dto: UpdatePilotProfileDto): Observable<string> {
    const url = `${this.adminBaseUrl}/profile/pilot/${pilotId}`;
    const formData = this.createFormData(dto);
    logApiRequest(this.SERVICE_NAME, 'updatePilotProfile', url, dto);
    return this.http.put<IApiResponse>(url, formData)
      .pipe(
        map(res => { logApiResponse(this.SERVICE_NAME, 'updatePilotProfile', res); return res.message || 'Profile updated.'; }),
        catchError(err => handleApiError(this.SERVICE_NAME, 'updatePilotProfile', err))
      );
  }

  /**
   * Updates a specific Supervisor's profile by ID.
   * Path: PUT /api/v1/Auth/admin/profile/supervisor/{id}
   */
  updateSupervisorProfile(supervisorId: string, dto: UpdateSupervisorProfileDto): Observable<string> {
    const url = `${this.adminBaseUrl}/profile/supervisor/${supervisorId}`;
    const formData = this.createFormData(dto);
    logApiRequest(this.SERVICE_NAME, 'updateSupervisorProfile', url, dto);
    return this.http.put<IApiResponse>(url, formData)
      .pipe(
        map(res => { logApiResponse(this.SERVICE_NAME, 'updateSupervisorProfile', res); return res.message || 'Profile updated.'; }),
        catchError(err => handleApiError(this.SERVICE_NAME, 'updateSupervisorProfile', err))
      );
  }

  /**
   * Updates a specific Attendant's profile by ID.
   * Path: PUT /api/v1/Auth/admin/profile/attendant/{id}
   */
  updateAttendantProfile(attendantId: string, dto: UpdateAttendantProfileDto): Observable<string> {
    const url = `${this.adminBaseUrl}/profile/attendant/${attendantId}`;
    const formData = this.createFormData(dto);
    logApiRequest(this.SERVICE_NAME, 'updateAttendantProfile', url, dto);
    return this.http.put<IApiResponse>(url, formData)
      .pipe(
        map(res => { logApiResponse(this.SERVICE_NAME, 'updateAttendantProfile', res); return res.message || 'Profile updated.'; }),
        catchError(err => handleApiError(this.SERVICE_NAME, 'updateAttendantProfile', err))
      );
  }

  // ==========================================================================
  // 5. Profile Retrieval
  // ==========================================================================

  /**
   * Gets the profile of the currently logged-in user.
   * Path: GET /api/v1/Auth/profile/me
   */
  getMyProfile(): Observable<AnyUserProfileDto> {
    const url = `${this.customerBaseUrl}/profile/me`;
    logApiRequest(this.SERVICE_NAME, 'getMyProfile', url);
    return this.http.get<IApiResponse<AnyUserProfileDto>>(url)
      .pipe(
        map(res => { logApiResponse(this.SERVICE_NAME, 'getMyProfile', res); return res.data!; }),
        catchError(err => handleApiError(this.SERVICE_NAME, 'getMyProfile', err))
      );
  }

  /**
   * Gets a specific SuperAdmin profile by ID.
   */
  getSuperAdminProfile(id: string): Observable<SuperAdminProfileDto> {
    const url = `${this.adminBaseUrl}/profile/superadmin/${id}`;
    logApiRequest(this.SERVICE_NAME, 'getSuperAdminProfile', url, { id });
    return this.http.get<IApiResponse<SuperAdminProfileDto>>(url)
      .pipe(
        map(res => { logApiResponse(this.SERVICE_NAME, 'getSuperAdminProfile', res); return res.data!; }),
        catchError(err => handleApiError(this.SERVICE_NAME, 'getSuperAdminProfile', err))
      );
  }

  /**
   * Gets a specific Admin profile by ID.
   */
  getAdminProfile(id: string): Observable<AdminProfileDto> {
    const url = `${this.adminBaseUrl}/profile/admin/${id}`;
    logApiRequest(this.SERVICE_NAME, 'getAdminProfile', url, { id });
    return this.http.get<IApiResponse<AdminProfileDto>>(url)
      .pipe(
        map(res => { logApiResponse(this.SERVICE_NAME, 'getAdminProfile', res); return res.data!; }),
        catchError(err => handleApiError(this.SERVICE_NAME, 'getAdminProfile', err))
      );
  }

  /**
   * Gets a specific Pilot profile by ID.
   */
  getPilotProfile(id: string): Observable<PilotProfileDto> {
    const url = `${this.adminBaseUrl}/profile/pilot/${id}`;
    logApiRequest(this.SERVICE_NAME, 'getPilotProfile', url, { id });
    return this.http.get<IApiResponse<PilotProfileDto>>(url)
      .pipe(
        map(res => { logApiResponse(this.SERVICE_NAME, 'getPilotProfile', res); return res.data!; }),
        catchError(err => handleApiError(this.SERVICE_NAME, 'getPilotProfile', err))
      );
  }

  /**
   * Gets a specific Supervisor profile by ID.
   */
  getSupervisorProfile(id: string): Observable<SupervisorProfileDto> {
    const url = `${this.adminBaseUrl}/profile/supervisor/${id}`;
    logApiRequest(this.SERVICE_NAME, 'getSupervisorProfile', url, { id });
    return this.http.get<IApiResponse<SupervisorProfileDto>>(url)
      .pipe(
        map(res => { logApiResponse(this.SERVICE_NAME, 'getSupervisorProfile', res); return res.data!; }),
        catchError(err => handleApiError(this.SERVICE_NAME, 'getSupervisorProfile', err))
      );
  }

  /**
   * Gets a specific Attendant profile by ID.
   */
  getAttendantProfile(id: string): Observable<AttendantProfileDto> {
    const url = `${this.adminBaseUrl}/profile/attendant/${id}`;
    logApiRequest(this.SERVICE_NAME, 'getAttendantProfile', url, { id });
    return this.http.get<IApiResponse<AttendantProfileDto>>(url)
      .pipe(
        map(res => { logApiResponse(this.SERVICE_NAME, 'getAttendantProfile', res); return res.data!; }),
        catchError(err => handleApiError(this.SERVICE_NAME, 'getAttendantProfile', err))
      );
  }

  // ==========================================================================
  // 6. Helpers
  // ==========================================================================

  /**
   * Helper utility to convert DTO objects into FormData.
   * Handles text fields, Dates, and File objects (e.g., profile pictures).
   * This is required because the backend expects [FromForm] for complex registrations/updates.
   */
  private createFormData(dto: any): FormData {
    const formData = new FormData();
    for (const key in dto) {
      if (dto.hasOwnProperty(key)) {
        const value = dto[key];

        // Handle File specifically
        if (key === 'profilePicture' && value instanceof File) {
          formData.append(key, value, value.name);
        }
        // Handle non-null values
        else if (value !== null && value !== undefined) {
          // Convert dates to ISO string, otherwise cast to string
          const valToSend = value instanceof Date ? value.toISOString() : value;
          formData.append(key, valToSend.toString());
        }
      }
    }
    return formData;
  }
}