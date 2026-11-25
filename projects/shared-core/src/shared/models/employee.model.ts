export interface IEmployeeFilterDto {
  role?: string;
  department?: string;
  isActive?: boolean;
}

export interface IEmployeeSummaryDto {
  employeeId: number;
  appUserId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: string;
  baseSalary: number;
  hireDate: string | Date;
  isActive: boolean;

  // Alternative/New Backend Fields
  fullName?: string;
  dateOfHire?: string | Date;
  salary?: string | number;
  position?: string;
  crewBaseAirportIata?: string;
}

export interface IEmployeeAnalyticsDto {
  // New Backend Fields
  totalActiveEmployees?: number;
  totalPilots?: number;
  totalAttendants?: number;
  totalAdmins?: number;
  totalSupervisors?: number;
  averageSalary?: number;
  employeesByBase?: { [baseIata: string]: number };

  // Old/Alternative Fields
  totalEmployees?: number;
  activeEmployees?: number;
  employeesByRole?: { [role: string]: number };
  employeesByDepartment?: { [department: string]: number };
}

export interface IUpdateSalaryRequestDto {
  newSalary: number;
  effectiveDate?: string | Date;
  reason?: string;
}
