using eMuhasebeServer.Application.Services;
using eMuhasebeServer.Domain.Entities;
using eMuhasebeServer.Domain.Repositories;
using GenericRepository;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Giderler.RestoreGider;

internal sealed class RestoreGiderCommandHandler(
    IGiderRepository giderRepository,
    ICashRegisterRepository cashRegisterRepository,
    ICashRegisterDetailRepository cashRegisterDetailRepository,
    IUnitOfWork unitOfWork,
    ICacheService cacheService) : IRequestHandler<RestoreGiderCommand, Result<string>>
{
    public async Task<Result<string>> Handle(RestoreGiderCommand request, CancellationToken cancellationToken)
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
            return Result<string>.Failure("Gider zaten aktif");
        }

        // If there was a cash register detail associated with this expense, we need to restore it
        if (gider.CashRegisterDetailId is not null)
        {
            CashRegisterDetail? detail = await cashRegisterDetailRepository
                .GetAll()
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(p => p.Id == gider.CashRegisterDetailId, cancellationToken);
            
            if (detail is not null)
            {
                CashRegister? cash = await cashRegisterRepository.GetByExpressionWithTrackingAsync(p => p.Id == detail.CashRegisterId, cancellationToken);
                if (cash is not null)
                {
                    cash.WithdrawalAmount += detail.WithdrawalAmount;
                    cashRegisterRepository.Update(cash);
                }
                
                detail.IsDeleted = false;
                cashRegisterDetailRepository.Update(detail);
            }
        }

        gider.IsDeleted = false;
        giderRepository.Update(gider);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        cacheService.Remove(cacheService.GetCompanyCacheKey("giderler"));
        cacheService.Remove(cacheService.GetCompanyCacheKey("cashRegisters"));

        return "Gider kaydı başarıyla geri yüklendi";
    }
}