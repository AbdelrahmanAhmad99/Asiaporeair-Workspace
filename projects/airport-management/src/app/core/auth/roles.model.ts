
export enum UserRole {
  SuperAdmin = 'SuperAdmin',
  Admin = 'Admin',
  Supervisor = 'Supervisor',
  Pilot = 'Pilot',
  Attendant = 'Attendant',
  User = 'User',
}

/** All internal staff roles — used to gate access to operations dashboards. */
export const EMPLOYEE_ROLES: UserRole[] = [
  UserRole.SuperAdmin,
  UserRole.Admin,
  UserRole.Supervisor,
  UserRole.Pilot,
  UserRole.Attendant,
];