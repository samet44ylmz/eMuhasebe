using eMuhasebeServer.Application.Services;
using eMuhasebeServer.Domain.Dtos;
using eMuhasebeServer.Domain.Entities;
using eMuhasebeServer.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Giderler.GetAllGiderler;

internal sealed class GetAllGiderQueryHandler(
    IGiderRepository giderRepository,
    ICacheService cacheService) : IRequestHandler<GetAllGiderlerQuery, Result<List<GiderDto>>>
{
    public async Task<Result<List<GiderDto>>> Handle(GetAllGiderlerQuery request, CancellationToken cancellationToken)
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
        
        // Convert to DTO
        var giderDtos = giderler.Select(g => new GiderDto(
            g.Id,
            g.Name,
            g.Date,
            g.CategoryType?.Value ?? 5,
            g.Description,
            g.Price,
            g.CashRegisterDetailId,
            g.PaidAmount,
            g.GiderCurrencyType?.Value ?? 1
        )).ToList();
        
        return giderDtos;
    }
}