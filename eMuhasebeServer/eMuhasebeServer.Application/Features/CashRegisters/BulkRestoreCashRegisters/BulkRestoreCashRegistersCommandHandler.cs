using eMuhasebeServer.Application.Services;
using eMuhasebeServer.Domain.Entities;
using eMuhasebeServer.Domain.Repositories;
using GenericRepository;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TS.Result;

namespace eMuhasebeServer.Application.Features.CashRegisters.BulkRestoreCashRegisters;

internal sealed class BulkRestoreCashRegistersCommandHandler(
    ICashRegisterRepository cashRegisterRepository,
    IUnitOfWork unitOfWork,
    ICacheService cacheService) : IRequestHandler<BulkRestoreCashRegistersCommand, Result<string>>
{
    public async Task<Result<string>> Handle(BulkRestoreCashRegistersCommand request, CancellationToken cancellationToken)
    {
        // IgnoreQueryFilters() ile query filter'ı bypass ediyoruz (silinen kasaları bulabilmek için)
        List<CashRegister> cashRegisters = await cashRegisterRepository
            .GetAll()
            .IgnoreQueryFilters()
            .Where(p => request.Ids.Contains(p.Id) && p.IsDeleted)
            .ToListAsync(cancellationToken);

        if (cashRegisters.Count == 0)
        {
            return Result<string>.Failure("Geri yüklenecek kasa bulunamadı");
        }

        foreach (var cashRegister in cashRegisters)
        {
            cashRegister.IsDeleted = false;
            cashRegisterRepository.Update(cashRegister);
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);
        
        // Clear the cashRegisters cache to ensure the restored cash registers appear in the list
        string cacheKey = cacheService.GetCompanyCacheKey("cashRegisters");
        cacheService.Remove(cacheKey);

        return $"{cashRegisters.Count} kasa başarıyla geri yüklendi";
    }
}