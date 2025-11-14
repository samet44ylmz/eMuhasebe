using eMuhasebeServer.Application.Services;
using eMuhasebeServer.Domain.Entities;
using eMuhasebeServer.Domain.Repositories;
using GenericRepository;
using MediatR;
using TS.Result;

namespace eMuhasebeServer.Application.Features.SalaryPayments.CreateSalaryPayment;

internal sealed class CreateSalaryPaymentCommandHandler(
    ISalaryPaymentRepository salaryPaymentRepository,
    ICashRegisterRepository cashRegisterRepository,
    ICashRegisterDetailRepository cashRegisterDetailRepository,
    IEmployeeRepository employeeRepository, // Added to get employee info
    IUnitOfWork unitOfWork,
    ICacheService cacheService
) : IRequestHandler<CreateSalaryPaymentCommand, Result<string>>
{
    public async Task<Result<string>> Handle(CreateSalaryPaymentCommand request, CancellationToken cancellationToken)
    {
        if (request.NetSalary <= 0)
        {
            return Result<string>.Failure("Net maaş 0'dan büyük olmalıdır");
        }

        // Get employee to calculate daily salary based on work days
        EmployeeDetails employee = await employeeRepository.GetByExpressionAsync(
            p => p.Id == request.EmployeeId, cancellationToken);

        if (employee is null)
        {
            return Result<string>.Failure("Çalışan bulunamadı");
        }

        // Calculate base salary based on work days if provided
        decimal calculatedBaseSalary = request.BaseSalary;
        if (request.WorkDays > 0 && request.WorkDays <= 30)
        {
            // Calculate daily rate from the employee's monthly salary
            decimal dailyRate = employee.Salary / 30;
            calculatedBaseSalary = dailyRate * request.WorkDays;
        }

        SalaryPayment salaryPayment = new()
        {
            EmployeeId = request.EmployeeId,
            PaymentDate = request.PaymentDate,
            PeriodStart = request.PeriodStart,
            PeriodEnd = request.PeriodEnd,
            BaseSalary = calculatedBaseSalary, // Use calculated base salary
            Overtime = request.Overtime,
            Bonus = request.Bonus,
            Allowances = request.Allowances,
            TaxDeduction = request.TaxDeduction,
            SocialSecurityDeduction = request.SocialSecurityDeduction,
            HealthInsuranceDeduction = request.HealthInsuranceDeduction,
            OtherDeductions = request.OtherDeductions,
            GrossSalary = request.GrossSalary,
            TotalDeductions = request.TotalDeductions,
            NetSalary = request.NetSalary,
            Amount = request.NetSalary, // Use NetSalary as Amount for compatibility
            Description = request.Description,
            CashRegisterDetailId = null,
            WorkDays = request.WorkDays,
            OvertimeHours = request.OvertimeHours,
            PaymentMethod = request.PaymentMethod
        };

        if (request.PayFromCash)
        {
            if (request.CashRegisterId is null)
            {
                return Result<string>.Failure("Kasa seçilmelidir");
            }

            CashRegister cash = await cashRegisterRepository.GetByExpressionWithTrackingAsync(
                p => p.Id == request.CashRegisterId.Value, cancellationToken);

            if (cash is null)
            {
                return Result<string>.Failure("Kasa bulunamadı");
            }

            cash.WithdrawalAmount += request.NetSalary;

            CashRegisterDetail detail = new()
            {
                Date = request.PaymentDate,
                Description = $"Maaş Ödemesi - {request.Description}",
                DepositAmount = 0,
                WithdrawalAmount = request.NetSalary,
                CashRegisterId = request.CashRegisterId.Value
            };

            salaryPayment.CashRegisterDetailId = detail.Id;

            await cashRegisterDetailRepository.AddAsync(detail, cancellationToken);
        }

        await salaryPaymentRepository.AddAsync(salaryPayment, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        cacheService.Remove(cacheService.GetCompanyCacheKey("salaryPayments"));
        cacheService.Remove(cacheService.GetCompanyCacheKey("cashRegisters"));

        return "Maaş ödemesi başarıyla kaydedildi";
    }
}