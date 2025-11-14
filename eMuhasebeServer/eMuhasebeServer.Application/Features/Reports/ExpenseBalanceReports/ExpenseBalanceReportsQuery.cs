using MediatR;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Reports.ExpenseBalanceReports;

public sealed record ExpenseBalanceReportsQuery : IRequest<Result<ExpenseBalanceReportsDto>>;

public sealed class ExpenseBalanceReportsDto
{
    public List<DateOnly> Dates { get; set; } = new();
    public List<decimal> OutstandingBalances { get; set; } = new();
    public List<decimal> PaidAmounts { get; set; } = new();
}