using eMuhasebeServer.Application.Services;
using eMuhasebeServer.Domain.Entities;
using eMuhasebeServer.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Giderler.GetAllGiderler;

internal sealed class GetAllGiderQueryHandler(
    IGiderRepository giderRepository,
    ICacheService cacheService) : IRequestHandler<GetAllGiderlerQuery, Result<List<Gider>>>
{
    public async Task<Result<List<Gider>>> Handle(GetAllGiderlerQuery request, CancellationToken cancellationToken)
    {
        List<Gider>? giderler;

        string cacheKey = cacheService.GetCompanyCacheKey("giderler");
        giderler = cacheService.Get<List<Gider>>(cacheKey);

        if (giderler is null)
        {
            giderler = await giderRepository.GetAll().OrderByDescending(p => p.Date).ToListAsync(cancellationToken);

            cacheService.Set(cacheKey, "giderler");
        }
        return giderler;
    }
}