using eMuhasebeServer.Application.Services;
using eMuhasebeServer.Domain.Entities;
using eMuhasebeServer.Domain.Repositories;
using GenericRepository;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TS.Result;

namespace eMuhasebeServer.Application.Features.CashRegisters.BulkPermanentDeleteCashRegisters;

internal sealed class BulkPermanentDeleteCashRegistersCommandHandler(
    ICashRegisterRepository cashRegisterRepository,
    IUnitOfWork unitOfWork,
    ICacheService cacheService) : IRequestHandler<BulkPermanentDeleteCashRegistersCommand, Result<string>>
{
    public async Task<Result<string>> Handle(BulkPermanentDeleteCashRegistersCommand request, CancellationToken cancellationToken)
    {
        // IgnoreQueryFilters() ile query filter'ı bypass ediyoruz (silinen kasaları bulabilmek için)
        List<CashRegister> cashRegisters = await cashRegisterRepository
            .GetAll()
            .IgnoreQueryFilters()
            .Where(p => request.Ids.Contains(p.Id) && p.IsDeleted)
            .ToListAsync(cancellationToken);

        if (cashRegisters.Count == 0)
        {
            return Result<string>.Failure("Silinecek kasa bulunamadı");
        }

        cashRegisterRepository.DeleteRange(cashRegisters);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        
        // Clear the cashRegisters cache to ensure the permanently deleted cash registers are removed from the list
        string cacheKey = cacheService.GetCompanyCacheKey("cashRegisters");
        cacheService.Remove(cacheKey);

        return $"{cashRegisters.Count} kasa kalıcı olarak silindi";
    }
}