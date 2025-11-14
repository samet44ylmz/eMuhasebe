using eMuhasebeServer.Application.Services;
using eMuhasebeServer.Domain.Entities;
using eMuhasebeServer.Domain.Repositories;
using GenericRepository;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Banks.BulkRestoreBanks;

internal sealed class BulkRestoreBanksCommandHandler(
    IBankRepository bankRepository,
    IUnitOfWork unitOfWork,
    ICacheService cacheService) : IRequestHandler<BulkRestoreBanksCommand, Result<string>>
{
    public async Task<Result<string>> Handle(BulkRestoreBanksCommand request, CancellationToken cancellationToken)
    {
        // IgnoreQueryFilters() ile query filter'ı bypass ediyoruz (silinen bankaları bulabilmek için)
        List<Bank> banks = await bankRepository
            .GetAll()
            .IgnoreQueryFilters()
            .Where(p => request.Ids.Contains(p.Id) && p.IsDeleted)
            .ToListAsync(cancellationToken);

        if (banks.Count == 0)
        {
            return Result<string>.Failure("Geri yüklenecek banka bulunamadı");
        }

        foreach (var bank in banks)
        {
            bank.IsDeleted = false;
            bankRepository.Update(bank);
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);
        
        // Clear the banks cache to ensure the restored banks appear in the list
        string cacheKey = cacheService.GetCompanyCacheKey("banks");
        cacheService.Remove(cacheKey);

        return $"{banks.Count} banka başarıyla geri yüklendi";
    }
}
