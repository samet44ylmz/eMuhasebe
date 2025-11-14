using eMuhasebeServer.Application.Services;
using eMuhasebeServer.Domain.Entities;
using eMuhasebeServer.Domain.Repositories;
using GenericRepository;
using MediatR;
using TS.Result;

namespace eMuhasebeServer.Application.Features.SalaryPayments.UpdateSalaryPayment;

internal sealed class UpdateSalaryPaymentCommandHandler(
    ISalaryPaymentRepository salaryPaymentRepository,
    ICashRegisterRepository cashRegisterRepository,
    ICashRegisterDetailRepository cashRegisterDetailRepository,
    IEmployeeRepository employeeRepository, // Added to get employee info
    IUnitOfWork unitOfWork,
    ICacheService cacheService
) : IRequestHandler<UpdateSalaryPaymentCommand, Result<string>>
{
    public async Task<Result<string>> Handle(UpdateSalaryPaymentCommand request, CancellationToken cancellationToken)
    {
        if (request.NetSalary <= 0)
        {
            return Result<string>.Failure("Net maaş 0'dan büyük olmalıdır");
        }

        SalaryPayment? salaryPayment = await salaryPaymentRepository.GetByExpressionWithTrackingAsync(
            p => p.Id == request.Id, cancellationToken);

        if (salaryPayment is null)
        {
            return Result<string>.Failure("Maaş ödemesi bulunamadı");
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

        // Update salary payment fields
        salaryPayment.EmployeeId = request.EmployeeId;
        salaryPayment.PaymentDate = request.PaymentDate;
        salaryPayment.PeriodStart = request.PeriodStart;
        salaryPayment.PeriodEnd = request.PeriodEnd;
        salaryPayment.BaseSalary = calculatedBaseSalary; // Use calculated base salary
        salaryPayment.Overtime = request.Overtime;
        salaryPayment.Bonus = request.Bonus;
        salaryPayment.Allowances = request.Allowances;
        salaryPayment.TaxDeduction = request.TaxDeduction;
        salaryPayment.SocialSecurityDeduction = request.SocialSecurityDeduction;
        salaryPayment.HealthInsuranceDeduction = request.HealthInsuranceDeduction;
        salaryPayment.OtherDeductions = request.OtherDeductions;
        salaryPayment.GrossSalary = request.GrossSalary;
        salaryPayment.TotalDeductions = request.TotalDeductions;
        salaryPayment.NetSalary = request.NetSalary;
        salaryPayment.Amount = request.NetSalary;
        salaryPayment.Description = request.Description;
        salaryPayment.WorkDays = request.WorkDays;
        salaryPayment.OvertimeHours = request.OvertimeHours;
        salaryPayment.PaymentMethod = request.PaymentMethod;

        // Handle cash register changes
        if (salaryPayment.CashRegisterDetailId is not null)
        {
            // Remove old cash register detail
            CashRegisterDetail? oldDetail = await cashRegisterDetailRepository.GetByExpressionWithTrackingAsync(
                p => p.Id == salaryPayment.CashRegisterDetailId.Value, cancellationToken);

            if (oldDetail is not null)
            {
                CashRegister? oldCash = await cashRegisterRepository.GetByExpressionWithTrackingAsync(
                    p => p.Id == oldDetail.CashRegisterId, cancellationToken);

                if (oldCash is not null)
                {
                    oldCash.WithdrawalAmount -= oldDetail.WithdrawalAmount;
                }

                cashRegisterDetailRepository.Delete(oldDetail);
            }
        }

        salaryPayment.CashRegisterDetailId = null;

        if (request.PayFromCash)
        {
            if (request.CashRegisterId is null)
            {
                return Result<string>.Failure("Kasa seçilmelidir");
            }

            CashRegister? cash = await cashRegisterRepository.GetByExpressionWithTrackingAsync(
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

        await unitOfWork.SaveChangesAsync(cancellationToken);

        cacheService.Remove(cacheService.GetCompanyCacheKey("salaryPayments"));
        cacheService.Remove(cacheService.GetCompanyCacheKey("cashRegisters"));

        return "Maaş ödemesi başarıyla güncellendi";
    }
}