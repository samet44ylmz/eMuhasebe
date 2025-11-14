using eMuhasebeServer.Domain.Entities;
using eMuhasebeServer.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Reports.InvoiceBalanceReports;

internal sealed class InvoiceBalanceReportsQueryHandler(
    IInvoiceRepository invoiceRepository) : IRequestHandler<InvoiceBalanceReportsQuery, Result<InvoiceBalanceReportsDto>>
{
    public async Task<Result<InvoiceBalanceReportsDto>> Handle(InvoiceBalanceReportsQuery request, CancellationToken cancellationToken)
    {
        // Get all invoices ordered by date
        List<Invoice> invoices = await invoiceRepository
            .GetAll()
            .Where(i => !i.IsDeleted)
            .OrderBy(i => i.Date)
            .ToListAsync(cancellationToken);

        // Group invoices by date and calculate balances
        var groupedData = invoices
            .GroupBy(i => i.Date)
            .Select(g => new
            {
                Date = g.Key,
                TotalAmount = g.Sum(i => i.Amount),
                PaidAmount = g.Sum(i => i.PaidAmount),
                OutstandingBalance = g.Sum(i => i.Amount - i.PaidAmount)
            })
            .ToList();

        var response = new InvoiceBalanceReportsDto
        {
            Dates = groupedData.Select(d => d.Date).ToList(),
            OutstandingBalances = groupedData.Select(d => d.OutstandingBalance).ToList(),
            PaidAmounts = groupedData.Select(d => d.PaidAmount).ToList()
        };

        return response;
    }
}