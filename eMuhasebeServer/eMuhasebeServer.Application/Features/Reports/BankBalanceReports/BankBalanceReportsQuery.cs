using MediatR;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Reports.BankBalanceReports;

public sealed record BankBalanceReportsQuery : IRequest<Result<List<BankBalanceDto>>>;

public sealed class BankBalanceDto
{
    public string BankName { get; set; } = string.Empty;
    public decimal Balance { get; set; }
}