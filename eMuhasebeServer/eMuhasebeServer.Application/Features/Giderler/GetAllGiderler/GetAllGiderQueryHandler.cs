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
            var query = giderRepository
                .GetAll()
                .Where(p => p.Date >= request.StartDate && p.Date <= request.EndDate); // Filter by date range

            // Filter by category ID if provided
            if (request.CategoryId.HasValue)
            {
                query = query.Where(p => (int)p.CategoryType == request.CategoryId.Value);
            }

            giderler = await query
                .OrderByDescending(p => p.Date)
                .ToListAsync(cancellationToken);

            cacheService.Set(cacheKey, "giderler");
        }
        else
        {
            // Filter by date range for cached data
            giderler = giderler
                .Where(p => p.Date >= request.StartDate && p.Date <= request.EndDate) // Filter by date range
                .ToList();
                
            // Filter by category ID if provided
            if (request.CategoryId.HasValue)
            {
                giderler = giderler.Where(p => (int)p.CategoryType == request.CategoryId.Value).ToList();
            }
        }
        
        return giderler;
    }
}