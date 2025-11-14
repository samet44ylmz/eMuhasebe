export class SalaryPaymentModel {
  id: string = "";
  employeeId: string = "";
  employeeName: string = "";
  paymentDate: string = "";
  periodStart: string = "";
  periodEnd: string = "";
  
  // Base Salary Components
  baseSalary: number = 0;
  overtime: number = 0;
  bonus: number = 0;
  allowances: number = 0;
  
  // Deductions
  taxDeduction: number = 0;
  socialSecurityDeduction: number = 0;
  healthInsuranceDeduction: number = 0;
  otherDeductions: number = 0;
  
  // Calculated Fields
  grossSalary: number = 0;
  totalDeductions: number = 0;
  netSalary: number = 0;
  
  // Legacy field
  amount: number = 0;
  
  description: string = "";
  cashRegisterDetailId: string | null = null;
  
  // Additional Info
  workDays: number = 0;
  overtimeHours: number = 0;
  paymentMethod: string = "";
}

export class CreateSalaryPaymentModel {
  employeeId: string = "";
  paymentDate: string = "";
  periodStart: string = "";
  periodEnd: string = "";
  
  // Base Salary Components
  baseSalary: number = 0;
  overtime: number = 0;
  bonus: number = 0;
  allowances: number = 0;
  
  // Deductions
  taxDeduction: number = 0;
  socialSecurityDeduction: number = 0;
  healthInsuranceDeduction: number = 0;
  otherDeductions: number = 0;
  
  // Calculated Fields (auto-calculated)
  grossSalary: number = 0;
  totalDeductions: number = 0;
  netSalary: number = 0;
  
  description: string = "";
  payFromCash: boolean = true;
  cashRegisterId: string | null = null;
  
  // Additional Info
  workDays: number = 0;
  overtimeHours: number = 0;
  paymentMethod: string = "Cash";
}

export class UpdateSalaryPaymentModel {
  id: string = "";
  employeeId: string = "";
  paymentDate: string = "";
  periodStart: string = "";
  periodEnd: string = "";
  
  // Base Salary Components
  baseSalary: number = 0;
  overtime: number = 0;
  bonus: number = 0;
  allowances: number = 0;
  
  // Deductions
  taxDeduction: number = 0;
  socialSecurityDeduction: number = 0;
  healthInsuranceDeduction: number = 0;
  otherDeductions: number = 0;
  
  // Calculated Fields (auto-calculated)
  grossSalary: number = 0;
  totalDeductions: number = 0;
  netSalary: number = 0;
  
  description: string = "";
  payFromCash: boolean = true;
  cashRegisterId: string | null = null;
  
  // Additional Info
  workDays: number = 0;
  overtimeHours: number = 0;
  paymentMethod: string = "Cash";
}
