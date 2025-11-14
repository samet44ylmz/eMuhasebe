using eMuhasebeServer.Application.Services;
using eMuhasebeServer.Domain.Entities;
using eMuhasebeServer.Domain.Enums;
using eMuhasebeServer.Domain.Repositories;
using GenericRepository;
using MediatR;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Giderler.UpdateGider;

internal sealed class UpdateGiderCommandHandler(
    IGiderRepository giderRepository,
    ICashRegisterRepository cashRegisterRepository,
    ICashRegisterDetailRepository cashRegisterDetailRepository,
    IUnitOfWork unitOfWork,
    ICacheService cacheService
) : IRequestHandler<UpdateGiderCommand, Result<string>>
{
    public async Task<Result<string>> Handle(UpdateGiderCommand request, CancellationToken cancellationToken)
    {
        Gider? gider = await giderRepository.GetByExpressionWithTrackingAsync(p => p.Id == request.Id, cancellationToken);
        if (gider is null)
        {
            return Result<string>.Failure("Gider bulunamadı");
        }

        bool hadCash = gider.CashRegisterDetailId is not null;

        if (request.Price <= 0)
        {
            return Result<string>.Failure("Tutar 0'dan büyük olmalıdır");
        }

        if (hadCash && request.IsCash)
        {
            CashRegisterDetail? detail = await cashRegisterDetailRepository.GetByExpressionWithTrackingAsync(p => p.Id == gider.CashRegisterDetailId, cancellationToken);
            if (detail is null)
            {
                return Result<string>.Failure("Kasa hareketi bulunamadı");
            }

            CashRegister? oldCash = await cashRegisterRepository.GetByExpressionWithTrackingAsync(p => p.Id == detail.CashRegisterId, cancellationToken);
            if (oldCash is null)
            {
                return Result<string>.Failure("Kasa bulunamadı");
            }

            oldCash.WithdrawalAmount -= detail.WithdrawalAmount;

            Guid targetCashId = request.CashRegisterId ?? detail.CashRegisterId;
            CashRegister? targetCash = oldCash.Id == targetCashId
                ? oldCash
                : await cashRegisterRepository.GetByExpressionWithTrackingAsync(p => p.Id == targetCashId, cancellationToken);
            if (targetCash is null)
            {
                return Result<string>.Failure("Kasa bulunamadı");
            }

            detail.CashRegisterId = targetCash.Id;
            detail.DepositAmount = 0;
            detail.WithdrawalAmount = request.Price;
            detail.Date = request.Date;
            detail.Description = request.Description;

            targetCash.WithdrawalAmount += request.Price;
        }
        else if (hadCash && !request.IsCash)
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
            cashRegisterDetailRepository.Delete(detail);
            gider.CashRegisterDetailId = null;
        }
        else if (!hadCash && request.IsCash)
        {
            if (request.CashRegisterId is null)
            {
                return Result<string>.Failure("Kasa seçilmelidir");
            }

            CashRegister? cash = await cashRegisterRepository.GetByExpressionWithTrackingAsync(p => p.Id == request.CashRegisterId.Value, cancellationToken);
            if (cash is null)
            {
                return Result<string>.Failure("Kasa bulunamadı");
            }

            cash.WithdrawalAmount += request.Price;

            CashRegisterDetail detail = new()
            {
                Date = request.Date,
                Description = request.Description,
                DepositAmount = 0,
                WithdrawalAmount = request.Price,
                CashRegisterId = request.CashRegisterId.Value,
                GiderId = gider.Id
            };

            gider.CashRegisterDetailId = detail.Id;
            await cashRegisterDetailRepository.AddAsync(detail, cancellationToken);
        }

        gider.Name = request.Name;
        gider.Date = request.Date;
        gider.CategoryType = GiderCategoryTypeEnum.FromValue(request.CategoryValue);
        gider.Description = request.Description;
        gider.Price = request.Price;

        await unitOfWork.SaveChangesAsync(cancellationToken);
        cacheService.Remove(cacheService.GetCompanyCacheKey("giderler"));
        cacheService.Remove(cacheService.GetCompanyCacheKey("cashRegisters"));

        return request.IsCash ? "Gider güncellendi (Kasa)" : "Gider güncellendi (Diğer)";
    }
}
