using eMuhasebeServer.Application.Services;
using eMuhasebeServer.Domain.Entities;
using eMuhasebeServer.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TS.Result;

namespace eMuhasebeServer.Application.Features.CashRegisters.GetAllCashRegisters;

internal sealed class GetAllCashRegistersQueryHandler(
    ICashRegisterRepository cashRegisterRepository,
    ICacheService cacheService) : IRequestHandler<GetAllCashRegistersQuery, Result<List<CashRegister>>>
{
    public async Task<Result<List<CashRegister>>> Handle(GetAllCashRegistersQuery request, CancellationToken cancellationToken)
    {
        List<CashRegister>? cashRegisters;

        string cacheKey = cacheService.GetCompanyCacheKey("cashRegisters");
        cashRegisters = cacheService.Get<List<CashRegister>>(cacheKey);

        if (cashRegisters is null)
        {
            cashRegisters =
            await cashRegisterRepository
            .GetAll().OrderBy(p => p.Name)
            .ToListAsync(cancellationToken);

            cacheService.Set(cacheKey, cashRegisters);
        }


        return cashRegisters;
    }
}