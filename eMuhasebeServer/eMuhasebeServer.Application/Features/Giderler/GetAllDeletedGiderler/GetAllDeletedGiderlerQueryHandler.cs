using eMuhasebeServer.Application.Services;
using eMuhasebeServer.Domain.Entities;
using eMuhasebeServer.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Giderler.GetAllDeletedGiderler;

internal sealed class GetAllDeletedGiderlerQueryHandler(
    IGiderRepository giderRepository) : IRequestHandler<GetAllDeletedGiderlerQuery, Result<List<Gider>>>
{
    public async Task<Result<List<Gider>>> Handle(GetAllDeletedGiderlerQuery request, CancellationToken cancellationToken)
    {
        // IgnoreQueryFilters() ile query filter'ı bypass ediyoruz (IsDeleted filter'ını devre dışı bırakıyoruz)
        List<Gider> giderler = await giderRepository
            .GetAll()
            .IgnoreQueryFilters()
            .Where(p => p.IsDeleted == true)
            .OrderBy(p => p.Name)
            .ToListAsync(cancellationToken);

        return giderler;
    }
}