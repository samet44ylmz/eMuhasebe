using eMuhasebeServer.Application.Services;
using eMuhasebeServer.Domain.Entities;
using eMuhasebeServer.Domain.Repositories;
using GenericRepository;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Giderler.DeleteGiderById;

public sealed record DeleteGiderByIdCommand(Guid Id) : IRequest<Result<string>>;

internal sealed class DeleteGiderByIdCommandHandler(
    IGiderRepository giderRepository,
    ICashRegisterRepository cashRegisterRepository,
    ICashRegisterDetailRepository cashRegisterDetailRepository,
    IUnitOfWork unitOfWork,
    ICacheService cacheService
) : IRequestHandler<DeleteGiderByIdCommand, Result<string>>
{
    public async Task<Result<string>> Handle(DeleteGiderByIdCommand request, CancellationToken cancellationToken)
    {
        Gider? gider = await giderRepository.GetByExpressionWithTrackingAsync(p => p.Id == request.Id, cancellationToken);
        if (gider is null)
        {
            return Result<string>.Failure("Gider bulunamadı");
        }

        // Find all cash register details related to payments for this expense
        // Updated to match the correct description pattern used in PayExpenseCommandHandler
        List<CashRegisterDetail> paymentDetails = await cashRegisterDetailRepository
            .GetAll()
            .Where(p => p.Description.StartsWith($"{gider.Name} Gideri Ödemesi"))
            .ToListAsync(cancellationToken);

        // Reverse all payments made for this expense
        foreach (var paymentDetail in paymentDetails)
        {
            CashRegister? paymentCashRegister = await cashRegisterRepository
                .GetByExpressionWithTrackingAsync(p => p.Id == paymentDetail.CashRegisterId, cancellationToken);
                
            if (paymentCashRegister is not null)
            {
                // Reverse the payment by adding back the withdrawal amount
                paymentCashRegister.WithdrawalAmount -= paymentDetail.WithdrawalAmount;
                cashRegisterRepository.Update(paymentCashRegister);
            }

            // Mark the payment detail as deleted
            paymentDetail.IsDeleted = true;
            cashRegisterDetailRepository.Update(paymentDetail);
        }

        // Handle the initial cash register detail when the expense was created
        if (gider.CashRegisterDetailId is not null)
        {
            CashRegisterDetail? detail = await cashRegisterDetailRepository.GetByExpressionWithTrackingAsync(p => p.Id == gider.CashRegisterDetailId, cancellationToken);
            if (detail is null)
            {
                return Result<string>.Failure("Kasa hareketi bulunamadı");
            }

            CashRegister? cash = await cashRegisterRepository.GetByExpressionWithTrackingAsync(p => p.Id == detail.CashRegisterId, cancellationToken);
            if (cash is null)
            {
                return Result<string>.Failure("Kasa bulunamadı");
            }

            cash.WithdrawalAmount -= detail.WithdrawalAmount;
            cashRegisterRepository.Update(cash);

            // Mark the cash register detail as deleted (soft delete)
            detail.IsDeleted = true;
            cashRegisterDetailRepository.Update(detail);
        }

        gider.IsDeleted = true;
        giderRepository.Update(gider); // Change from hard delete to soft delete
        await unitOfWork.SaveChangesAsync(cancellationToken);

        cacheService.Remove(cacheService.GetCompanyCacheKey("giderler"));
        cacheService.Remove(cacheService.GetCompanyCacheKey("cashRegisters"));

        return "Gider başarıyla silindi";
    }
}