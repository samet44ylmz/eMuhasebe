using MediatR;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Reports.CashRegisterBalanceReports;

public sealed record CashRegisterBalanceReportsQuery : IRequest<Result<List<CashRegisterBalanceDto>>>;

public sealed class CashRegisterBalanceDto
{
    public string CashRegisterName { get; set; } = string.Empty;
    public decimal Balance { get; set; }
}