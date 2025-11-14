using eMuhasebeServer.Application.Services;
using eMuhasebeServer.Domain.Entities;
using eMuhasebeServer.Domain.Repositories;
using GenericRepository;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Banks.RestoreBank;

internal sealed class RestoreBankCommandHandler(
    IBankRepository bankRepository,
    IUnitOfWork unitOfWork,
    ICacheService cacheService) : IRequestHandler<RestoreBankCommand, Result<string>>
{
    public async Task<Result<string>> Handle(RestoreBankCommand request, CancellationToken cancellationToken)
    {
        // IgnoreQueryFilters() ile query filter'ı bypass ediyoruz (silinen bankaları bulabilmek için)
        Bank? bank = await bankRepository
            .GetAll()
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

        if (bank is null)
        {
            return Result<string>.Failure("Banka bulunamadı");
        }

        if (!bank.IsDeleted)
        {
            return Result<string>.Failure("Banka zaten aktif");
        }

        bank.IsDeleted = false;
        bankRepository.Update(bank);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        
        // Clear the banks cache to ensure the restored bank appears in the list
        string cacheKey = cacheService.GetCompanyCacheKey("banks");
        cacheService.Remove(cacheKey);

        return "Banka başarıyla geri yüklendi";
    }
}