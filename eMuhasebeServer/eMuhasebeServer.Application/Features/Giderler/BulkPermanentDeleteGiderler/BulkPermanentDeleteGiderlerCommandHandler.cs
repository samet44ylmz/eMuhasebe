using eMuhasebeServer.Application.Services;
using eMuhasebeServer.Domain.Entities;
using eMuhasebeServer.Domain.Repositories;
using GenericRepository;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Giderler.BulkPermanentDeleteGiderler;

internal sealed class BulkPermanentDeleteGiderlerCommandHandler(
    IGiderRepository giderRepository,
    ICashRegisterRepository cashRegisterRepository,
    ICashRegisterDetailRepository cashRegisterDetailRepository,
    IUnitOfWork unitOfWork,
    ICacheService cacheService) : IRequestHandler<BulkPermanentDeleteGiderlerCommand, Result<string>>
{
    public async Task<Result<string>> Handle(BulkPermanentDeleteGiderlerCommand request, CancellationToken cancellationToken)
    {
        // IgnoreQueryFilters() ile query filter'ı bypass ediyoruz (silinen giderleri bulabilmek için)
        List<Gider> giderler = await giderRepository
            .GetAll()
            .IgnoreQueryFilters()
            .Where(p => request.Ids.Contains(p.Id) && p.IsDeleted)
            .ToListAsync(cancellationToken);

        if (giderler.Count == 0)
        {
            return Result<string>.Failure("Silinecek gider bulunamadı");
        }

        // Process each expense to handle payments
        foreach (var gider in giderler)
        {
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
        }

        // If there were cash register details associated with these expenses, we need to permanently delete them too
        List<Guid> detailIds = giderler
            .Where(g => g.CashRegisterDetailId.HasValue)
            .Select(g => g.CashRegisterDetailId!.Value) // Use ! to assert non-null
            .ToList();

        if (detailIds.Any())
        {
            List<CashRegisterDetail> details = await cashRegisterDetailRepository
                .GetAll()
                .IgnoreQueryFilters()
                .Where(p => detailIds.Contains(p.Id) && p.IsDeleted)
                .ToListAsync(cancellationToken);
            
            if (details.Any())
            {
                cashRegisterDetailRepository.DeleteRange(details);
            }
        }

        giderRepository.DeleteRange(giderler);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        cacheService.Remove(cacheService.GetCompanyCacheKey("giderler"));
        cacheService.Remove(cacheService.GetCompanyCacheKey("cashRegisters"));

        return $"{giderler.Count} gider kalıcı olarak silindi";
    }
}