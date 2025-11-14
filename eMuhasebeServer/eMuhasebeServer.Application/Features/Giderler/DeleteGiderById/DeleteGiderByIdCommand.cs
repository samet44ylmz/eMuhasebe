using eMuhasebeServer.Application.Services;
using eMuhasebeServer.Domain.Entities;
using eMuhasebeServer.Domain.Repositories;
using GenericRepository;
using MediatR;
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
            cashRegisterDetailRepository.Delete(detail);
        }

        gider.IsDeleted = true;
        giderRepository.Update(gider); // Change from hard delete to soft delete
        await unitOfWork.SaveChangesAsync(cancellationToken);

        cacheService.Remove(cacheService.GetCompanyCacheKey("giderler"));
        cacheService.Remove(cacheService.GetCompanyCacheKey("cashRegisters"));

        return "Gider başarıyla silindi";
    }
}