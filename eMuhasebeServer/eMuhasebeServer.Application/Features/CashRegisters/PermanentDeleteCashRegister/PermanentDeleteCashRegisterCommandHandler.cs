using eMuhasebeServer.Application.Services;
using eMuhasebeServer.Domain.Entities;
using eMuhasebeServer.Domain.Repositories;
using GenericRepository;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TS.Result;

namespace eMuhasebeServer.Application.Features.CashRegisters.PermanentDeleteCashRegister;

internal sealed class PermanentDeleteCashRegisterCommandHandler(
    ICashRegisterRepository cashRegisterRepository,
    IUnitOfWork unitOfWork,
    ICacheService cacheService) : IRequestHandler<PermanentDeleteCashRegisterCommand, Result<string>>
{
    public async Task<Result<string>> Handle(PermanentDeleteCashRegisterCommand request, CancellationToken cancellationToken)
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
            return Result<string>.Failure("Önce kasa kaydını silmeniz gerekir");
        }

        cashRegisterRepository.Delete(cashRegister);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        
        // Clear the cashRegisters cache to ensure the permanently deleted cash register is removed from the list
        string cacheKey = cacheService.GetCompanyCacheKey("cashRegisters");
        cacheService.Remove(cacheKey);

        return "Kasa kaydı kalıcı olarak silindi";
    }
}