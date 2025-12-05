using eMuhasebeServer.Application.Services;
using eMuhasebeServer.Domain.Entities;
using eMuhasebeServer.Domain.Enums;
using eMuhasebeServer.Domain.Repositories;
using GenericRepository;
using MediatR;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Giderler.CreateGider;

internal sealed class CreateGiderCommandHandler(
    ICashRegisterRepository cashRegisterRepository,
    ICashRegisterDetailRepository cashRegisterDetailRepository,
    IGiderRepository giderRepository,
    IUnitOfWork unitOfWork,
    ICacheService cacheService
) : IRequestHandler<CreateGiderCommand, Result<string>>
{
    public async Task<Result<string>> Handle(CreateGiderCommand request, CancellationToken cancellationToken)
    {
        if (request.Price <= 0)
        {
            return Result<string>.Failure("Tutar 0'dan büyük olmalıdır");
        }

        // Create Gider entity with essential fields
        Gider gider = new()
        {
            Name = request.Name,
            Date = request.Date,
            CategoryType = GiderCategoryTypeEnum.FromValue(request.CategoryValue),
            GiderCurrencyType = GiderCurrencyTypeEnum.FromValue(request.GiderCurrencyTypeValue),
            Description = request.Description,
            Price = request.Price,
            CashRegisterDetailId = null,
            PaidAmount = (request.IsCash.HasValue && request.IsCash.Value) ? request.Price : 0 // If cash payment, mark as fully paid
        };

        // Process expense payment (cash withdrawal) only if explicitly marked as cash
        if (request.IsCash.HasValue && request.IsCash.Value)
        {
            if (request.CashRegisterId is null)
            {
                return Result<string>.Failure("Kasa seçilmelidir");
            }

            CashRegister cash = await cashRegisterRepository.GetByExpressionWithTrackingAsync(
                p => p.Id == request.CashRegisterId.Value, cancellationToken);

            cash.WithdrawalAmount += request.Price;

            CashRegisterDetail detail = new()
            {
                Date = request.Date,
                Description = $"{request.Name} Gideri Ödemesi - {request.Description}",
                DepositAmount = 0,
                WithdrawalAmount = request.Price,
                CashRegisterId = request.CashRegisterId.Value,
                GiderId = gider.Id
            };

            // Link both ways
            gider.CashRegisterDetailId = detail.Id;

            await cashRegisterDetailRepository.AddAsync(detail, cancellationToken);
        }

        await giderRepository.AddAsync(gider, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        cacheService.Remove(cacheService.GetCompanyCacheKey("giderler"));
        cacheService.Remove(cacheService.GetCompanyCacheKey("cashRegisters"));

        string resultMessage = (request.IsCash.HasValue && request.IsCash.Value) ? "Gider kaydedildi (Kasa) - Ödeme yapıldı" : "Gider kaydedildi";

        return resultMessage;
    }
}