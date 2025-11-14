using MediatR;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Reports.InvoiceBalanceReports;

public sealed record InvoiceBalanceReportsQuery : IRequest<Result<InvoiceBalanceReportsDto>>;

public sealed class InvoiceBalanceReportsDto
{
    public List<DateOnly> Dates { get; set; } = new();
    public List<decimal> OutstandingBalances { get; set; } = new();
    public List<decimal> PaidAmounts { get; set; } = new();
}