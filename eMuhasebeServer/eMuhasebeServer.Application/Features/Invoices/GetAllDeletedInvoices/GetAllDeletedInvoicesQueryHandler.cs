using eMuhasebeServer.Application.Services;
using eMuhasebeServer.Domain.Entities;
using eMuhasebeServer.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Invoices.GetAllDeletedInvoices;

internal sealed class GetAllDeletedInvoicesQueryHandler(
    IInvoiceRepository invoiceRepository) : IRequestHandler<GetAllDeletedInvoicesQuery, Result<List<Invoice>>>
{
    public async Task<Result<List<Invoice>>> Handle(GetAllDeletedInvoicesQuery request, CancellationToken cancellationToken)
    {
        // IgnoreQueryFilters() ile query filter'ı bypass ediyoruz (IsDeleted filter'ını devre dışı bırakıyoruz)
        List<Invoice> invoices = await invoiceRepository
            .GetAll()
            .IgnoreQueryFilters()
            .Where(p => p.IsDeleted == true)
            .Include(p => p.Customer) // Include customer data
            .OrderBy(p => p.InvoiceNumber)
            .ToListAsync(cancellationToken);

        return invoices;
    }
}