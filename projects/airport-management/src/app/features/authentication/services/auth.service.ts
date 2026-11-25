
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
      case UserRole.Admin:
      case UserRole.Supervisor:
      case UserRole.Pilot:
      case UserRole.Attendant:
        // All AOMS staff land on the Operations Center (primary shell home).
        // Legacy paths (/aoms/dashboard, /aoms/operations, …) redirect or 404'd
        // into the wildcard and fought with in-app navigation.
        this.router.navigate(['/aoms/operations-center']);
        break;

      case UserRole.User:
        this.router.navigate(['/flight-info/search']);
        break;

      default:
        console.error(`AuthService: Unknown role '${role}' detected. Redirecting to home.`);
        this.router.navigate(['/']);
        break;
    }
  }

  // ==========================================================================
  // 2. Password Management
  // ==========================================================================

  /**
   * Sends a password reset link to the user's email.
   * Path: POST /api/v1/Auth/forgot-password
   */
  forgotPassword(dto: ForgotPasswordDto): Observable<string> {
    const url = `${this.customerBaseUrl}/forgot-password`;
    return this.http.post<IApiResponse>(url, dto)
      .pipe(map(res => res.message || 'Password reset link sent.'));
  }

  /**
   * Resets the password using the token received via email.
   * Path: POST /api/v1/Auth/reset-password
   */
  resetPassword(dto: ResetPasswordDto): Observable<string> {
    const url = `${this.customerBaseUrl}/reset-password`;
    return this.http.post<IApiResponse>(url, dto)
      .pipe(map(res => res.message || 'Password reset successful.'));
  }

  /**
   * Changes the password for the currently logged-in user.
   * Path: POST /api/v1/Auth/change-password
   */
  changePassword(dto: ChangePasswordDto): Observable<string> {
    const url = `${this.customerBaseUrl}/change-password`;
    return this.http.post<IApiResponse>(url, dto)
      .pipe(map(res => res.message || 'Password changed successfully.'));
  }

  // ==========================================================================
  // 3. Registration (Using FormData for Profile Pictures)
  // ==========================================================================

  /**
   * Registers a new Passenger/User (Public).
   * Path: POST /api/v1/Auth/register-user
   */
  registerUser(dto: UserDto): Observable<string> {
    const url = `${this.customerBaseUrl}/register-user`;
    const formData = this.createFormData(dto);
    return this.http.post<IApiResponse>(url, formData)
      .pipe(map(res => res.message || 'Registration successful.'));
  }

  /**
   * Registers the initial SuperAdmin (Public/Bootstrapping).
   * Path: POST /api/v1/Auth/register-superadmin
   */
  registerSuperAdmin(dto: SuperAdminDto): Observable<string> {
    const url = `${this.customerBaseUrl}/register-superadmin`;
    const formData = this.createFormData(dto);
    return this.http.post<IApiResponse>(url, formData)
      .pipe(map(res => res.message || 'SuperAdmin registered.'));
  }

  /**
   * Registers a new Admin.
   * Path: POST /api/v1/Auth/admin/register-admin
   */
  registerAdmin(dto: AdminDto): Observable<string> {
    const url = `${this.adminBaseUrl}/register-admin`;
    const formData = this.createFormData(dto);
    return this.http.post<IApiResponse>(url, formData)
      .pipe(map(res => res.message || 'Admin registered.'));
  }

  /**
   * Registers a new Supervisor.
   * Path: POST /api/v1/Auth/admin/register-supervisor
   */
  registerSupervisor(dto: SupervisorDto): Observable<string> {
    const url = `${this.adminBaseUrl}/register-supervisor`;
    const formData = this.createFormData(dto);
    return this.http.post<IApiResponse>(url, formData)
      .pipe(map(res => res.message || 'Supervisor registered.'));
  }

  /**
   * Registers a new Pilot.
   * Path: POST /api/v1/Auth/admin/register-pilot
   */
  registerPilot(dto: PilotDto): Observable<string> {
    const url = `${this.adminBaseUrl}/register-pilot`;
    const formData = this.createFormData(dto);
    return this.http.post<IApiResponse>(url, formData)
      .pipe(map(res => res.message || 'Pilot registered.'));
  }

  /**
   * Registers a new Attendant.
   * Path: POST /api/v1/Auth/admin/register-attendant
   */
  registerAttendant(dto: AttendantDto): Observable<string> {
    const url = `${this.adminBaseUrl}/register-attendant`;
    const formData = this.createFormData(dto);
    return this.http.post<IApiResponse>(url, formData)
      .pipe(map(res => res.message || 'Attendant registered.'));
  }

  // ==========================================================================
  // 4. Profile Updates (Using FormData)
  // ==========================================================================

  /**
   * Updates the authenticated User's own profile.
   * Path: PUT /api/v1/Auth/profile/user
   */
  updateUserProfile(dto: UpdateUserProfileDto): Observable<string> {
    const url = `${this.customerBaseUrl}/profile/user`;
    const formData = this.createFormData(dto);
    return this.http.put<IApiResponse>(url, formData)
      .pipe(map(res => res.message || 'Profile updated.'));
  }

  /**
   * Updates the authenticated SuperAdmin's own profile.
   * Path: PUT /api/v1/Auth/profile/superadmin
   */
  updateSuperAdminProfile(dto: UpdateSuperAdminProfileDto): Observable<string> {
    const url = `${this.customerBaseUrl}/profile/superadmin`;
    const formData = this.createFormData(dto);
    return this.http.put<IApiResponse>(url, formData)
      .pipe(map(res => res.message || 'Profile updated.'));
  }

  /**
   * Updates a specific Admin's profile by ID.
   * Path: PUT /api/v1/Auth/admin/profile/admin/{id}
   */
  updateAdminProfile(adminId: string, dto: UpdateAdminProfileDto): Observable<string> {
    const url = `${this.adminBaseUrl}/profile/admin/${adminId}`;
    const formData = this.createFormData(dto);
    return this.http.put<IApiResponse>(url, formData)
      .pipe(map(res => res.message || 'Profile updated.'));
  }

  /**
   * Updates a specific Pilot's profile by ID.
   * Path: PUT /api/v1/Auth/admin/profile/pilot/{id}
   */
  updatePilotProfile(pilotId: string, dto: UpdatePilotProfileDto): Observable<string> {
    const url = `${this.adminBaseUrl}/profile/pilot/${pilotId}`;
    const formData = this.createFormData(dto);
    return this.http.put<IApiResponse>(url, formData)
      .pipe(map(res => res.message || 'Profile updated.'));
  }

  /**
   * Updates a specific Supervisor's profile by ID.
   * Path: PUT /api/v1/Auth/admin/profile/supervisor/{id}
   */
  updateSupervisorProfile(supervisorId: string, dto: UpdateSupervisorProfileDto): Observable<string> {
    const url = `${this.adminBaseUrl}/profile/supervisor/${supervisorId}`;
    const formData = this.createFormData(dto);
    return this.http.put<IApiResponse>(url, formData)
      .pipe(map(res => res.message || 'Profile updated.'));
  }

  /**
   * Updates a specific Attendant's profile by ID.
   * Path: PUT /api/v1/Auth/admin/profile/attendant/{id}
   */
  updateAttendantProfile(attendantId: string, dto: UpdateAttendantProfileDto): Observable<string> {
    const url = `${this.adminBaseUrl}/profile/attendant/${attendantId}`;
    const formData = this.createFormData(dto);
    return this.http.put<IApiResponse>(url, formData)
      .pipe(map(res => res.message || 'Profile updated.'));
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
    return this.http.get<IApiResponse<AnyUserProfileDto>>(url)
      .pipe(map(res => res.data!));
  }

  /**
   * Gets a specific Passenger/User profile by ID.
   */
  getUserProfile(id: string): Observable<PassengerProfileDto> {
    const url = `${this.customerBaseUrl}/profile/user/${id}`;
    return this.http.get<IApiResponse<PassengerProfileDto>>(url)
      .pipe(map(res => res.data!));
  }

  /**
   * Gets a specific SuperAdmin profile by ID.
   */
  getSuperAdminProfile(id: string): Observable<SuperAdminProfileDto> {
    const url = `${this.adminBaseUrl}/profile/superadmin/${id}`;
    return this.http.get<IApiResponse<SuperAdminProfileDto>>(url)
      .pipe(map(res => res.data!));
  }

  /**
   * Gets a specific Admin profile by ID.
   */
  getAdminProfile(id: string): Observable<AdminProfileDto> {
    const url = `${this.adminBaseUrl}/profile/admin/${id}`;
    return this.http.get<IApiResponse<AdminProfileDto>>(url)
      .pipe(map(res => res.data!));
  }

  /**
   * Gets a specific Pilot profile by ID.
   */
  getPilotProfile(id: string): Observable<PilotProfileDto> {
    const url = `${this.adminBaseUrl}/profile/pilot/${id}`;
    return this.http.get<IApiResponse<PilotProfileDto>>(url)
      .pipe(map(res => res.data!));
  }

  /**
   * Gets a specific Supervisor profile by ID.
   */
  getSupervisorProfile(id: string): Observable<SupervisorProfileDto> {
    const url = `${this.adminBaseUrl}/profile/supervisor/${id}`;
    return this.http.get<IApiResponse<SupervisorProfileDto>>(url)
      .pipe(map(res => res.data!));
  }

  /**
   * Gets a specific Attendant profile by ID.
   */
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