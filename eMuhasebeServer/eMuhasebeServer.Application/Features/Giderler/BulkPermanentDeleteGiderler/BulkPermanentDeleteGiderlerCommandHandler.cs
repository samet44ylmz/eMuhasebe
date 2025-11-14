using eMuhasebeServer.Application.Services;
using eMuhasebeServer.Domain.Entities;
using eMuhasebeServer.Domain.Repositories;
using GenericRepository;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Giderler.BulkPermanentDeleteGiderler;

internal sealed class BulkPermanentDeleteGiderlerCommandHandler(
    IGiderRepository giderRepository,
    ICashRegisterDetailRepository cashRegisterDetailRepository,
    IUnitOfWork unitOfWork,
    ICacheService cacheService) : IRequestHandler<BulkPermanentDeleteGiderlerCommand, Result<string>>
{
    public async Task<Result<string>> Handle(BulkPermanentDeleteGiderlerCommand request, CancellationToken cancellationToken)
    {
        // IgnoreQueryFilters() ile query filter'ı bypass ediyoruz (silinen giderleri bulabilmek için)
        List<Gider> giderler = await giderRepository
            .GetAll()
            .IgnoreQueryFilters()
            .Where(p => request.Ids.Contains(p.Id) && p.IsDeleted)
            .ToListAsync(cancellationToken);

        if (giderler.Count == 0)
        {
            return Result<string>.Failure("Silinecek gider bulunamadı");
        }

        // If there were cash register details associated with these expenses, we need to permanently delete them too
        List<Guid> detailIds = giderler
            .Where(g => g.CashRegisterDetailId.HasValue)
            .Select(g => g.CashRegisterDetailId!.Value) // Use ! to assert non-null
            .ToList();

        if (detailIds.Any())
        {
            List<CashRegisterDetail> details = await cashRegisterDetailRepository
                .GetAll()
                .IgnoreQueryFilters()
                .Where(p => detailIds.Contains(p.Id) && p.IsDeleted)
                .ToListAsync(cancellationToken);
            
            if (details.Any())
            {
                cashRegisterDetailRepository.DeleteRange(details);
            }
        }

        giderRepository.DeleteRange(giderler);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        cacheService.Remove(cacheService.GetCompanyCacheKey("giderler"));

        return $"{giderler.Count} gider kalıcı olarak silindi";
    }
}