using eMuhasebeServer.Application.Services;
using eMuhasebeServer.Domain.Entities;
using eMuhasebeServer.Domain.Repositories;
using GenericRepository;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Banks.BulkPermanentDeleteBanks;

internal sealed class BulkPermanentDeleteBanksCommandHandler(
    IBankRepository bankRepository,
    IUnitOfWork unitOfWork,
    ICacheService cacheService) : IRequestHandler<BulkPermanentDeleteBanksCommand, Result<string>>
{
    public async Task<Result<string>> Handle(BulkPermanentDeleteBanksCommand request, CancellationToken cancellationToken)
    {
        // IgnoreQueryFilters() ile query filter'ı bypass ediyoruz (silinen bankaları bulabilmek için)
        List<Bank> banks = await bankRepository
            .GetAll()
            .IgnoreQueryFilters()
            .Where(p => request.Ids.Contains(p.Id) && p.IsDeleted)
            .ToListAsync(cancellationToken);

        if (banks.Count == 0)
        {
            return Result<string>.Failure("Silinecek banka bulunamadı");
        }

        bankRepository.DeleteRange(banks);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        
        // Clear the banks cache to ensure the permanently deleted banks are removed from the list
        string cacheKey = cacheService.GetCompanyCacheKey("banks");
        cacheService.Remove(cacheKey);

        return $"{banks.Count} banka kalıcı olarak silindi";
    }
}
