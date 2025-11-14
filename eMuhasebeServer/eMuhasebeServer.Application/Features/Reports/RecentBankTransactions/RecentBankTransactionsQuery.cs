using MediatR;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Reports.RecentBankTransactions;

public sealed record RecentBankTransactionsQuery : IRequest<Result<List<RecentBankTransactionDto>>>;

public sealed class RecentBankTransactionDto
{
    public string BankName { get; set; } = string.Empty;
    public DateOnly Date { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal DepositAmount { get; set; }
    public decimal WithdrawalAmount { get; set; }
    public decimal Balance { get; set; }
}