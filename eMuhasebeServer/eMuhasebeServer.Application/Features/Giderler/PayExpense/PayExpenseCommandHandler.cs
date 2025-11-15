using eMuhasebeServer.Application.Services;
using eMuhasebeServer.Domain.Entities;
using eMuhasebeServer.Domain.Enums;
using eMuhasebeServer.Domain.Repositories;
using GenericRepository;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Giderler.PayExpense;

internal sealed class PayExpenseCommandHandler(
    IGiderRepository giderRepository,
    ICashRegisterRepository cashRegisterRepository,
    ICashRegisterDetailRepository cashRegisterDetailRepository,
    IUnitOfWork unitOfWork,
    ICacheService cacheService) : IRequestHandler<PayExpenseCommand, Result<string>>
{
    public async Task<Result<string>> Handle(PayExpenseCommand request, CancellationToken cancellationToken)
    {
        // Get the expense
        Gider? expense = await giderRepository
            .GetAll()
            .FirstOrDefaultAsync(p => p.Id == request.ExpenseId, cancellationToken);

        if (expense is null)
        {
            return Result<string>.Failure("Gider bulunamadı");
        }

        // Check if the payment amount is valid
        if (request.PaymentAmount <= 0)
        {
            return Result<string>.Failure("Ödeme tutarı 0'dan büyük olmalıdır");
        }

        // Check if the payment would exceed the expense amount
        if (expense.PaidAmount + request.PaymentAmount > expense.Price)
        {
            return Result<string>.Failure("Ödeme tutarı gider tutarını aşamaz");
        }

        // Update the expense's paid amount
        expense.PaidAmount += request.PaymentAmount;
        giderRepository.Update(expense);

        // If a cash register is specified, update it
        if (request.CashRegisterId.HasValue)
        {
            CashRegister? cashRegister = await cashRegisterRepository
                .GetByExpressionWithTrackingAsync(p => p.Id == request.CashRegisterId.Value, cancellationToken);

            if (cashRegister is not null)
            {
                // For expenses, when making a payment, money is going out (withdrawal)
                cashRegister.WithdrawalAmount += request.PaymentAmount;

                // Create cash register detail record
                CashRegisterDetail cashRegisterDetail = new()
                {
                    CashRegisterId = cashRegister.Id,
                    Date = request.PaymentDate,
                    Description = $"{expense.Name} Gideri Ödemesi - {request.Description}",
                    DepositAmount = 0, // No deposit for expense payments
                    WithdrawalAmount = request.PaymentAmount // Withdrawal for expense payments
                };

                await cashRegisterDetailRepository.AddAsync(cashRegisterDetail, cancellationToken);
            }
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);

        // Clear caches
        cacheService.Remove(cacheService.GetCompanyCacheKey("giderler"));
        cacheService.Remove(cacheService.GetCompanyCacheKey("cashRegisters"));

        return "Gider ödemesi başarıyla kaydedildi";
    }
}