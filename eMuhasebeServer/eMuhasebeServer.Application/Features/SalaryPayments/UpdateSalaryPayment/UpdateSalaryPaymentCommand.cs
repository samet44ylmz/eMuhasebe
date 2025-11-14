using MediatR;
using TS.Result;

namespace eMuhasebeServer.Application.Features.SalaryPayments.UpdateSalaryPayment;

public sealed record UpdateSalaryPaymentCommand(
    Guid Id,
    Guid EmployeeId,
    DateOnly PaymentDate,
    DateOnly PeriodStart,
    DateOnly PeriodEnd,
    decimal BaseSalary,
    decimal Overtime,
    decimal Bonus,
    decimal Allowances,
    decimal TaxDeduction,
    decimal SocialSecurityDeduction,
    decimal HealthInsuranceDeduction,
    decimal OtherDeductions,
    decimal GrossSalary,
    decimal TotalDeductions,
    decimal NetSalary,
    string Description,
    bool PayFromCash,
    Guid? CashRegisterId,
    int WorkDays,
    decimal OvertimeHours,
    string PaymentMethod
) : IRequest<Result<string>>;
