using eMuhasebeServer.Application.Services;
using eMuhasebeServer.Domain.Entities;
using eMuhasebeServer.Domain.Repositories;
using GenericRepository;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Banks.PermanentDeleteBank;

internal sealed class PermanentDeleteBankCommandHandler(
    IBankRepository bankRepository,
    IUnitOfWork unitOfWork,
    ICacheService cacheService) : IRequestHandler<PermanentDeleteBankCommand, Result<string>>
{
    public async Task<Result<string>> Handle(PermanentDeleteBankCommand request, CancellationToken cancellationToken)
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
            return Result<string>.Failure("Önce bankayı silmeniz gerekir");
        }

        bankRepository.Delete(bank);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        
        // Clear the banks cache to ensure the permanently deleted bank is removed from the list
        string cacheKey = cacheService.GetCompanyCacheKey("banks");
        cacheService.Remove(cacheKey);

        return "Banka kalıcı olarak silindi";
    }
}