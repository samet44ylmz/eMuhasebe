using eMuhasebeServer.Application.Services;
using eMuhasebeServer.Domain.Entities;
using eMuhasebeServer.Domain.Repositories;
using GenericRepository;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TS.Result;

namespace eMuhasebeServer.Application.Features.CashRegisters.RestoreCashRegister;

internal sealed class RestoreCashRegisterCommandHandler(
    ICashRegisterRepository cashRegisterRepository,
    IUnitOfWork unitOfWork,
    ICacheService cacheService) : IRequestHandler<RestoreCashRegisterCommand, Result<string>>
{
    public async Task<Result<string>> Handle(RestoreCashRegisterCommand request, CancellationToken cancellationToken)
    {
        // IgnoreQueryFilters() ile query filter'ı bypass ediyoruz (silinen kasaları bulabilmek için)
        CashRegister? cashRegister = await cashRegisterRepository
            .GetAll()
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

        if (cashRegister is null)
        {
            return Result<string>.Failure("Kasa kaydı bulunamadı");
        }

        if (!cashRegister.IsDeleted)
        {
            return Result<string>.Failure("Kasa zaten aktif");
        }

        cashRegister.IsDeleted = false;
        cashRegisterRepository.Update(cashRegister);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        
        // Clear the cashRegisters cache to ensure the restored cash register appears in the list
        string cacheKey = cacheService.GetCompanyCacheKey("cashRegisters");
        cacheService.Remove(cacheKey);

        return "Kasa kaydı başarıyla geri yüklendi";
    }
}