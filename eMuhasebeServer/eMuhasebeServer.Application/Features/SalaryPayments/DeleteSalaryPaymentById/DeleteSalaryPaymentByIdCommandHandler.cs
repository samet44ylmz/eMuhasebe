using eMuhasebeServer.Application.Services;
using eMuhasebeServer.Domain.Entities;
using eMuhasebeServer.Domain.Repositories;
using GenericRepository;
using MediatR;
using TS.Result;

namespace eMuhasebeServer.Application.Features.SalaryPayments.DeleteSalaryPaymentById;

internal sealed class DeleteSalaryPaymentByIdCommandHandler(
    ISalaryPaymentRepository salaryPaymentRepository,
    ICashRegisterRepository cashRegisterRepository,
    ICashRegisterDetailRepository cashRegisterDetailRepository,
    IGiderRepository giderRepository,
    IUnitOfWork unitOfWork,
    ICacheService cacheService
) : IRequestHandler<DeleteSalaryPaymentByIdCommand, Result<string>>
{
    public async Task<Result<string>> Handle(DeleteSalaryPaymentByIdCommand request, CancellationToken cancellationToken)
    {
        SalaryPayment? salaryPayment = await salaryPaymentRepository.GetByExpressionWithTrackingAsync(p => p.Id == request.Id, cancellationToken);
        if (salaryPayment is null)
        {
            return Result<string>.Failure("Maaş ödemesi bulunamadı");
        }

        if (salaryPayment.CashRegisterDetailId is not null)
        {
            CashRegisterDetail? detail = await cashRegisterDetailRepository.GetByExpressionWithTrackingAsync(p => p.Id == salaryPayment.CashRegisterDetailId, cancellationToken);
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

            // Delete associated Gider (Expense) if exists
            if (detail.GiderId is not null)
            {
                Gider? gider = await giderRepository.GetByExpressionWithTrackingAsync(p => p.Id == detail.GiderId, cancellationToken);
                if (gider is not null)
                {
                    giderRepository.Delete(gider);
                }
            }

            cashRegisterDetailRepository.Delete(detail);
        }

        salaryPaymentRepository.Delete(salaryPayment);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        cacheService.Remove(cacheService.GetCompanyCacheKey("salaryPayments"));
        cacheService.Remove(cacheService.GetCompanyCacheKey("cashRegisters"));
        cacheService.Remove(cacheService.GetCompanyCacheKey("giderler"));

        return "Maaş ödemesi başarıyla silindi";
    }
}
