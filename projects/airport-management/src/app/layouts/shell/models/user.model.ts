
export type UserRole =
    | 'SuperAdmin'
    | 'Admin'
    | 'Supervisor'
    | 'Pilot'
    | 'Attendant';

export type AppTheme = 'light' | 'dark';

export interface AuthenticatedUser {
    id: string;
    fullName: string;
    email: string;
    role: UserRole;
    avatarUrl?: string;
    employeeCode: string;
    homeBase: string; // IATA airport code
}

export interface NavigationItem {
    id: string;
    label: string;
    icon: string; // SVG path data
    route: string;
    requiredRoles: UserRole[];
    badge?: number;
    children?: NavigationItem[];
}