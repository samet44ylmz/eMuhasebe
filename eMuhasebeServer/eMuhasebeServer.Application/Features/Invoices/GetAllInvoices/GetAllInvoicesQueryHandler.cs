using eMuhasebeServer.Application.Services;
using eMuhasebeServer.Domain.Entities;
using eMuhasebeServer.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Invoices.GetAllInvoices;

internal sealed class GetAllInvoicesQueryHandler(
    IInvoiceRepository invoiceRepository,
    ICacheService cacheService
    ) : IRequestHandler<GetAllInvoicesQuery, Result<List<Invoice>>>
{
    public async Task<Result<List<Invoice>>> Handle(GetAllInvoicesQuery request, CancellationToken cancellationToken)
    {
        List<Invoice>? invoices;
        string key = cacheService.GetCompanyCacheKey("invoices");

        invoices = cacheService.Get<List<Invoice>>(key);

        if (invoices is null)
        {
            invoices =
                await invoiceRepository
                .GetAll()
                .Where(p => !p.IsDeleted) // Explicitly filter out deleted invoices
                .Include(p => p.Customer)
                .Include(p => p.Details!)
                .ThenInclude(p => p.Product)
                .OrderBy(p => p.Date)
                .ToListAsync(cancellationToken);

            cacheService.Set(key, "invoices");
        }
        else
        {
            // Filter out deleted invoices from cached data as well
            invoices = invoices.Where(p => !p.IsDeleted).ToList();
        }

        return invoices;
    }
}