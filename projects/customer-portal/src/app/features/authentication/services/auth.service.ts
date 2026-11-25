
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

// --- Core Services & Models ---
import { IApiResponse } from '../../../core/models/api-response.model';
import { TokenStoreService } from '../../../core/auth/token-store.service';
import { AuthStateService } from '../../../core/auth/auth-state.service';
import { AuthSessionResponse, RefreshTokenRequest } from '../../../core/auth/session.model';
import { UserRole } from '../../../core/auth/roles.model';

// --- Domain Models & DTOs ---
import {
  LoginDto, ForgotPasswordDto, ResetPasswordDto, ChangePasswordDto,
  UserDto, SuperAdminDto, AdminDto, SupervisorDto, PilotDto, AttendantDto,
  UpdateUserProfileDto, UpdatePilotProfileDto, UpdateAdminProfileDto, UpdateSuperAdminProfileDto,
  UpdateSupervisorProfileDto, UpdateAttendantProfileDto,
  AnyUserProfileDto, PassengerProfileDto, SuperAdminProfileDto,
  AdminProfileDto, PilotProfileDto, AttendantProfileDto, SupervisorProfileDto
} from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // Base API URLs based on Controller structure
  private readonly customerBaseUrl = `${environment.apiUrl}/Auth`;
  private readonly adminBaseUrl = `${environment.apiUrl}/Auth/admin`;

  constructor(
    private http: HttpClient,
    private tokenStore: TokenStoreService,
    private authState: AuthStateService,
    private router: Router
  ) { }

  // ==========================================================================
  // 1. Authentication & Session Management
  // ==========================================================================

  login(loginDto: LoginDto): Observable<AuthSessionResponse> {
    const url = `${this.customerBaseUrl}/login`;
    this.logRequest('login', url, loginDto);

    return this.http.post<IApiResponse<AuthSessionResponse>>(url, loginDto)
      .pipe(
        map(response => {
          this.logResponse('login', response);
          if (!response || !response.data) {
            throw new Error('Invalid server response: Data is missing');
          }
          return response.data;
        }),
        tap(session => {
          this.tokenStore.setToken(session.token);
          this.tokenStore.setRefreshToken(session.refreshToken);

          // Handle both nested and flattened profile responses
          let profile = session.userProfile;
          if (!profile && (session as any).id && (session as any).userType) {
            profile = {
              id: (session as any).id,
              firstName: (session as any).firstName,
              lastName: (session as any).lastName,
              email: (session as any).email,
              userType: (session as any).userType,
              createdAt: (session as any).createdAt || new Date().toISOString()
            } as any;
          }

          if (profile) {
            this.authState.setAuthState(profile);
            this.redirectBasedOnRole(profile.userType);
          } else {
            console.error('[AuthService] User profile missing in response. Raw data:', session);
          }
        }),
        catchError(error => this.handleError('login', error))
      );
  }


  /**
   * Logs the user out by clearing local storage tokens and resetting application state.
   */
  logout(): void {
    this.tokenStore.clearTokens();
    this.authState.clearAuthState();
    // Redirect all users to the public login page after logout
    this.router.navigate(['/auth/login']);
  }

  // --- Omitted: refreshToken (Remains unchanged) ---

  // ==========================================================================
  // 1.5. Role-Based Navigation Logic  
  // ==========================================================================

  /**
   * @method redirectBasedOnRole
   * @description Redirects the authenticated user to the appropriate dashboard/portal 
   * based on their assigned UserRole.
   * Maps employee roles to the AOMS dashboard and the User role to the CBES portal.
   * @param role The UserRole of the authenticated user.
   */
  public redirectBasedOnRole(role: UserRole): void {
    if (!role) {
      this.router.navigate(['/auth/login']);
      return;
    }

    switch (role) {
      case UserRole.SuperAdmin:
        // SuperAdmin gets top-level access to the internal system
        this.router.navigate(['/aoms/super-admin/dashboard']);
        break;

      case UserRole.Admin:
        // Admin gets the main operational dashboard
        this.router.navigate(['/aoms/admin/dashboard']);
        break;

      case UserRole.Supervisor:
        // Supervisor goes to their operations view
        this.router.navigate(['/aoms/supervisor/operations']);
        break;

      case UserRole.Pilot:
        // Pilot goes to the flight deck/scheduling view
        this.router.navigate(['/aoms/crew/flight-schedule']);
        break;

      case UserRole.Attendant:
        // Attendant goes to the cabin crew manifest/service view
        this.router.navigate(['/aoms/crew/cabin-service']);
        break;

      case UserRole.User:
        // User (Passenger) goes to the main flight search page
        this.router.navigate(['/Home']);
        break;

      default:
        // Fallback for unexpected roles
        console.error(`AuthService: Unknown role '${role}' detected. Redirecting to home.`);
        this.router.navigate(['/']);
        break;
    }
  }

  // ==========================================================================
  // 2. Password Management
  // ==========================================================================

  forgotPassword(dto: ForgotPasswordDto): Observable<string> {
    const url = `${this.customerBaseUrl}/forgot-password`;
    return this.http.post<IApiResponse>(url, dto)
      .pipe(map(res => res.message || 'Password reset link sent.'));
  }


  resetPassword(dto: ResetPasswordDto): Observable<string> {
    const url = `${this.customerBaseUrl}/reset-password`;
    return this.http.post<IApiResponse>(url, dto)
      .pipe(map(res => res.message || 'Password reset successful.'));
  }


  changePassword(dto: ChangePasswordDto): Observable<string> {
    const url = `${this.customerBaseUrl}/change-password`;
    return this.http.post<IApiResponse>(url, dto)
      .pipe(map(res => res.message || 'Password changed successfully.'));
  }

  // ==========================================================================
  // 3. Registration (Using FormData for Profile Pictures)
  // ==========================================================================


  registerUser(dto: UserDto): Observable<string> {
    const url = `${this.customerBaseUrl}/register-user`;
    const formData = this.createFormData(dto);
    return this.http.post<IApiResponse>(url, formData)
      .pipe(map(res => res.message || 'Registration successful.'));
  }


  registerSuperAdmin(dto: SuperAdminDto): Observable<string> {
    const url = `${this.customerBaseUrl}/register-superadmin`;
    const formData = this.createFormData(dto);
    return this.http.post<IApiResponse>(url, formData)
      .pipe(map(res => res.message || 'SuperAdmin registered.'));
  }


  registerAdmin(dto: AdminDto): Observable<string> {
    const url = `${this.adminBaseUrl}/register-admin`;
    const formData = this.createFormData(dto);
    return this.http.post<IApiResponse>(url, formData)
      .pipe(map(res => res.message || 'Admin registered.'));
  }


  registerSupervisor(dto: SupervisorDto): Observable<string> {
    const url = `${this.adminBaseUrl}/register-supervisor`;
    const formData = this.createFormData(dto);
    return this.http.post<IApiResponse>(url, formData)
      .pipe(map(res => res.message || 'Supervisor registered.'));
  }


  registerPilot(dto: PilotDto): Observable<string> {
    const url = `${this.adminBaseUrl}/register-pilot`;
    const formData = this.createFormData(dto);
    return this.http.post<IApiResponse>(url, formData)
      .pipe(map(res => res.message || 'Pilot registered.'));
  }


  registerAttendant(dto: AttendantDto): Observable<string> {
    const url = `${this.adminBaseUrl}/register-attendant`;
    const formData = this.createFormData(dto);
    return this.http.post<IApiResponse>(url, formData)
      .pipe(map(res => res.message || 'Attendant registered.'));
  }

  // ==========================================================================
  // 4. Profile Updates (Using FormData)
  // ==========================================================================


  updateUserProfile(dto: UpdateUserProfileDto): Observable<string> {
    const url = `${this.customerBaseUrl}/profile/user`;
    const formData = this.createFormData(dto);
    return this.http.put<IApiResponse>(url, formData)
      .pipe(map(res => res.message || 'Profile updated.'));
  }


  updateSuperAdminProfile(dto: UpdateSuperAdminProfileDto): Observable<string> {
    const url = `${this.customerBaseUrl}/profile/superadmin`;
    const formData = this.createFormData(dto);
    return this.http.put<IApiResponse>(url, formData)
      .pipe(map(res => res.message || 'Profile updated.'));
  }


  updateAdminProfile(adminId: string, dto: UpdateAdminProfileDto): Observable<string> {
    const url = `${this.adminBaseUrl}/profile/admin/${adminId}`;
    const formData = this.createFormData(dto);
    return this.http.put<IApiResponse>(url, formData)
      .pipe(map(res => res.message || 'Profile updated.'));
  }


  updatePilotProfile(pilotId: string, dto: UpdatePilotProfileDto): Observable<string> {
    const url = `${this.adminBaseUrl}/profile/pilot/${pilotId}`;
    const formData = this.createFormData(dto);
    return this.http.put<IApiResponse>(url, formData)
      .pipe(map(res => res.message || 'Profile updated.'));
  }


  updateSupervisorProfile(supervisorId: string, dto: UpdateSupervisorProfileDto): Observable<string> {
    const url = `${this.adminBaseUrl}/profile/supervisor/${supervisorId}`;
    const formData = this.createFormData(dto);
    return this.http.put<IApiResponse>(url, formData)
      .pipe(map(res => res.message || 'Profile updated.'));
  }


  updateAttendantProfile(attendantId: string, dto: UpdateAttendantProfileDto): Observable<string> {
    const url = `${this.adminBaseUrl}/profile/attendant/${attendantId}`;
    const formData = this.createFormData(dto);
    return this.http.put<IApiResponse>(url, formData)
      .pipe(map(res => res.message || 'Profile updated.'));
  }

  // ==========================================================================
  // 5. Profile Retrieval
  // ==========================================================================


  getMyProfile(): Observable<AnyUserProfileDto> {
    const url = `${this.customerBaseUrl}/profile/me`;
    return this.http.get<IApiResponse<AnyUserProfileDto>>(url)
      .pipe(map(res => res.data!));
  }


  getUserProfile(id: string): Observable<PassengerProfileDto> {
    const url = `${this.customerBaseUrl}/profile/user/${id}`;
    return this.http.get<IApiResponse<PassengerProfileDto>>(url)
      .pipe(map(res => res.data!));
  }


  getSuperAdminProfile(id: string): Observable<SuperAdminProfileDto> {
    const url = `${this.adminBaseUrl}/profile/superadmin/${id}`;
    return this.http.get<IApiResponse<SuperAdminProfileDto>>(url)
      .pipe(map(res => res.data!));
  }

  getAdminProfile(id: string): Observable<AdminProfileDto> {
    const url = `${this.adminBaseUrl}/profile/admin/${id}`;
    return this.http.get<IApiResponse<AdminProfileDto>>(url)
      .pipe(map(res => res.data!));
  }


  getPilotProfile(id: string): Observable<PilotProfileDto> {
    const url = `${this.adminBaseUrl}/profile/pilot/${id}`;
    return this.http.get<IApiResponse<PilotProfileDto>>(url)
      .pipe(map(res => res.data!));
  }


  getSupervisorProfile(id: string): Observable<SupervisorProfileDto> {
    const url = `${this.adminBaseUrl}/profile/supervisor/${id}`;
    return this.http.get<IApiResponse<SupervisorProfileDto>>(url)
      .pipe(map(res => res.data!));
  }


  getAttendantProfile(id: string): Observable<AttendantProfileDto> {
    const url = `${this.adminBaseUrl}/profile/attendant/${id}`;
    return this.http.get<IApiResponse<AttendantProfileDto>>(url)
      .pipe(map(res => res.data!));
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


        if (key === 'profilePicture' && value instanceof File) {
          formData.append(key, value, value.name);
        }

        else if (value !== null && value !== undefined) {
          const valToSend = value instanceof Date ? value.toISOString() : value;
          formData.append(key, valToSend.toString());
        }
      }
    }
    return formData;
  }

  // ==========================================================================
  // 7. Testing & Logging Helpers (Requested by User)
  // PRIVATE HELPERS & LOGGING 
  //=========================================================================== 

  /** 
  * Logs outgoing API requests for development debugging. 
  */
  private logRequest(method: string, url: string, payload?: any): void {
    if (!environment.production) {
      console.groupCollapsed(`[AuthService] Request: ${method}`);
      console.log('URL:', url);
      if (payload) console.log('Payload/Params:', payload);
      console.groupEnd();
    }
  }

  /** 
  * Logs incoming API responses for development debugging. 
  */
  private logResponse(method: string, response: any): void {
    if (!environment.production) {
      console.groupCollapsed(`[AuthService] Response: ${method}`);
      console.log('Status:', response?.statusCode);
      console.log('Data:', response?.data);
      console.groupEnd();
    }
  }

  /** 
  * Centralized per-method error handling. 
  * Logs errors aggressively for development and re-throws for UI consumption. 
  */
  private handleError(method: string, error: HttpErrorResponse): Observable<never> {
    const timestamp = new Date().toISOString();

    // Verbose Error Logging 
    console.error(`--- [AuthService] Error in ${method} at ${timestamp} ---`);
    console.error(`Status: ${error.status} (${error.statusText})`);
    console.error(`URL: ${error.url}`);

    if (error.error && error.error.message) {
      console.error(`Backend Message: ${error.error.message}`);
    }

    if (error.error && error.error.errors) {
      console.error('Validation Errors:', error.error.errors);
    }

    console.error('Full Error Object:', error);
    console.error('---------------------------------------------------');

    return throwError(() => error);
  }
}