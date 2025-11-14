using eMuhasebeServer.Domain.Entities;
using eMuhasebeServer.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Reports.BankBalanceReports;

internal sealed class BankBalanceReportsQueryHandler(
    IBankRepository bankRepository) : IRequestHandler<BankBalanceReportsQuery, Result<List<BankBalanceDto>>>
{
    public async Task<Result<List<BankBalanceDto>>> Handle(BankBalanceReportsQuery request, CancellationToken cancellationToken)
    {
        // Get all banks with their balances
        List<Bank> banks = await bankRepository
            .GetAll()
            .Where(b => !b.IsDeleted)
            .ToListAsync(cancellationToken);

        // Calculate balance for each bank (Deposit - Withdrawal)
        List<BankBalanceDto> result = banks
            .Select(b => new BankBalanceDto
            {
                BankName = b.Name,
                Balance = b.DepositAmount - b.WithdrawalAmount
            })
            .ToList();

        return result;
    }
}