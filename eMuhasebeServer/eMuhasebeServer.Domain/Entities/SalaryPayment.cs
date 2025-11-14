using eMuhasebeServer.Domain.Abstractions;

namespace eMuhasebeServer.Domain.Entities;

public sealed class SalaryPayment : Entity
{
    public Guid EmployeeId { get; set; }
    public DateOnly PaymentDate { get; set; }
    public DateOnly PeriodStart { get; set; }
    public DateOnly PeriodEnd { get; set; }
    
    // Base Salary Components
    public decimal BaseSalary { get; set; }
    public decimal Overtime { get; set; }
    public decimal Bonus { get; set; }
    public decimal Allowances { get; set; }
    
    // Deductions
    public decimal TaxDeduction { get; set; }
    public decimal SocialSecurityDeduction { get; set; }
    public decimal HealthInsuranceDeduction { get; set; }
    public decimal OtherDeductions { get; set; }
    
    // Calculated Fields
    public decimal GrossSalary { get; set; }
    public decimal TotalDeductions { get; set; }
    public decimal NetSalary { get; set; }
    
    // Legacy field for compatibility
    public decimal Amount { get; set; }
    
    public string Description { get; set; } = string.Empty;
    public Guid? CashRegisterDetailId { get; set; }
    
    // Additional Info
    public int WorkDays { get; set; }
    public decimal OvertimeHours { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
}
