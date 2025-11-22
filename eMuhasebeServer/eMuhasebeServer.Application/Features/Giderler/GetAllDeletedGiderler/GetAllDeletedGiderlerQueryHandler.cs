using eMuhasebeServer.Application.Services;
using eMuhasebeServer.Domain.Dtos;
using eMuhasebeServer.Domain.Entities;
using eMuhasebeServer.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Giderler.GetAllDeletedGiderler;

internal sealed class GetAllDeletedGiderlerQueryHandler(
    IGiderRepository giderRepository) : IRequestHandler<GetAllDeletedGiderlerQuery, Result<List<GiderDto>>>
{
    public async Task<Result<List<GiderDto>>> Handle(GetAllDeletedGiderlerQuery request, CancellationToken cancellationToken)
    {
        // IgnoreQueryFilters() ile query filter'ı bypass ediyoruz (IsDeleted filter'ını devre dışı bırakıyoruz)
        List<Gider> giderler = await giderRepository
            .GetAll()
            .IgnoreQueryFilters()
            .Where(p => p.IsDeleted == true)
            .OrderBy(p => p.Name)
            .ToListAsync(cancellationToken);

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