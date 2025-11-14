using eMuhasebeServer.Application.Services;
using eMuhasebeServer.Domain.Entities;
using eMuhasebeServer.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Banks.GetAllBanks;

internal sealed class GetAllBanksQueryHandler(
   IBankRepository bankRepository,
   ICacheService cacheService) : IRequestHandler<GetAllBanksQuery, Result<List<Bank>>>
{
    public async Task<Result<List<Bank>>> Handle(GetAllBanksQuery request, CancellationToken cancellationToken)
    {
        List<Bank>? banks;

        string cacheKey = cacheService.GetCompanyCacheKey("banks");
        banks = cacheService.Get<List<Bank>>(cacheKey);

        if (banks is null)
        {
            banks = await bankRepository.GetAll().OrderBy(p => p.Name).ToListAsync(cancellationToken);

            cacheService.Set(cacheKey, banks);
        }
        return banks;
    }
}

