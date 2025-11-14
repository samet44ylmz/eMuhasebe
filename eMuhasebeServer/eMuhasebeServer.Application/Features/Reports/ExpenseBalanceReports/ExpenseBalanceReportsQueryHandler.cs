using eMuhasebeServer.Domain.Entities;
using eMuhasebeServer.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Reports.ExpenseBalanceReports;

internal sealed class ExpenseBalanceReportsQueryHandler(
    IGiderRepository giderRepository) : IRequestHandler<ExpenseBalanceReportsQuery, Result<ExpenseBalanceReportsDto>>
{
    public async Task<Result<ExpenseBalanceReportsDto>> Handle(ExpenseBalanceReportsQuery request, CancellationToken cancellationToken)
    {
        // Get all expenses ordered by date
        List<Gider> expenses = await giderRepository
            .GetAll()
            .Where(i => !i.IsDeleted)
            .OrderBy(i => i.Date)
            .ToListAsync(cancellationToken);

        // Group expenses by date and calculate balances
        var groupedData = expenses
            .GroupBy(i => i.Date)
            .Select(g => new
            {
                Date = g.Key,
                TotalAmount = g.Sum(i => i.Price),
                PaidAmount = g.Sum(i => i.PaidAmount),
                OutstandingBalance = g.Sum(i => i.Price - i.PaidAmount)
            })
            .ToList();

        var response = new ExpenseBalanceReportsDto
        {
            Dates = groupedData.Select(d => d.Date).ToList(),
            OutstandingBalances = groupedData.Select(d => d.OutstandingBalance).ToList(),
            PaidAmounts = groupedData.Select(d => d.PaidAmount).ToList()
        };

        return response;
    }
}