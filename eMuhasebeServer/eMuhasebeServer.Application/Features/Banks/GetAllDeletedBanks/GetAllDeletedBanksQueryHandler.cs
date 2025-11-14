using eMuhasebeServer.Application.Services;
using eMuhasebeServer.Domain.Entities;
using eMuhasebeServer.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Banks.GetAllDeletedBanks;

internal sealed class GetAllDeletedBanksQueryHandler(
    IBankRepository bankRepository) : IRequestHandler<GetAllDeletedBanksQuery, Result<List<Bank>>>
{
    public async Task<Result<List<Bank>>> Handle(GetAllDeletedBanksQuery request, CancellationToken cancellationToken)
    {
        // IgnoreQueryFilters() ile query filter'ı bypass ediyoruz (IsDeleted filter'ını devre dışı bırakıyoruz)
        List<Bank> banks = await bankRepository
            .GetAll()
            .IgnoreQueryFilters()
            .Where(p => p.IsDeleted == true)
            .OrderBy(p => p.Name)
            .ToListAsync(cancellationToken);

        return banks;
    }
}