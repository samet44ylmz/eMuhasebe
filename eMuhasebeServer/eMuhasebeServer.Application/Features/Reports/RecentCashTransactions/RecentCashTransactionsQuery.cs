using MediatR;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Reports.RecentCashTransactions;

public sealed record RecentCashTransactionsQuery : IRequest<Result<List<RecentCashTransactionDto>>>;

public sealed class RecentCashTransactionDto
{
    public string CashRegisterName { get; set; } = string.Empty;
    public DateOnly Date { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal DepositAmount { get; set; }
    public decimal WithdrawalAmount { get; set; }
    public decimal Balance { get; set; }
}