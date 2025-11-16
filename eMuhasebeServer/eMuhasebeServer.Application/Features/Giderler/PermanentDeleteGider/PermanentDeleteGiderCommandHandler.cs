using eMuhasebeServer.Application.Services;
using eMuhasebeServer.Domain.Entities;
using eMuhasebeServer.Domain.Repositories;
using GenericRepository;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Giderler.PermanentDeleteGider;

internal sealed class PermanentDeleteGiderCommandHandler(
    IGiderRepository giderRepository,
    ICashRegisterRepository cashRegisterRepository,
    ICashRegisterDetailRepository cashRegisterDetailRepository,
    IUnitOfWork unitOfWork,
    ICacheService cacheService) : IRequestHandler<PermanentDeleteGiderCommand, Result<string>>
{
    public async Task<Result<string>> Handle(PermanentDeleteGiderCommand request, CancellationToken cancellationToken)
    {
        // IgnoreQueryFilters() ile query filter'ı bypass ediyoruz (silinen giderleri bulabilmek için)
        Gider? gider = await giderRepository
            .GetAll()
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

        if (gider is null)
        {
            return Result<string>.Failure("Gider bulunamadı");
        }

        if (!gider.IsDeleted)
        {
            return Result<string>.Failure("Önce gider kaydını silmeniz gerekir");
        }

        // Find all cash register details related to payments for this expense
        List<CashRegisterDetail> paymentDetails = await cashRegisterDetailRepository
            .GetAll()
            .IgnoreQueryFilters()
            .Where(p => p.Description.Contains($"{gider.Name} Gideri Ödemesi") && p.IsDeleted == false)
            .ToListAsync(cancellationToken);

        // Reverse all payments made for this expense
        foreach (var paymentDetail in paymentDetails)
        {
            CashRegister? paymentCashRegister = await cashRegisterRepository
                .GetAll()
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(p => p.Id == paymentDetail.CashRegisterId, cancellationToken);
                
            if (paymentCashRegister is not null)
            {
                // Reverse the payment by adding back the withdrawal amount
                paymentCashRegister.WithdrawalAmount -= paymentDetail.WithdrawalAmount;
                cashRegisterRepository.Update(paymentCashRegister);
            }

            // Permanently delete the payment detail
            cashRegisterDetailRepository.Delete(paymentDetail);
        }

        // If there was a cash register detail associated with this expense, we need to permanently delete it too
        if (gider.CashRegisterDetailId is not null)
        {
            CashRegisterDetail? detail = await cashRegisterDetailRepository
                .GetAll()
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(p => p.Id == gider.CashRegisterDetailId && p.IsDeleted, cancellationToken);
            
            if (detail is not null)
            {
                cashRegisterDetailRepository.Delete(detail);
            }
        }

        giderRepository.Delete(gider);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        cacheService.Remove(cacheService.GetCompanyCacheKey("giderler"));
        cacheService.Remove(cacheService.GetCompanyCacheKey("cashRegisters"));

        return "Gider kaydı kalıcı olarak silindi";
    }
}