using eMuhasebeServer.Domain.Entities;
using eMuhasebeServer.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Reports.RecentBankTransactions;

internal sealed class RecentBankTransactionsQueryHandler(
    IBankDetailRepository bankDetailRepository,
    IBankRepository bankRepository) : IRequestHandler<RecentBankTransactionsQuery, Result<List<RecentBankTransactionDto>>>
{
    public async Task<Result<List<RecentBankTransactionDto>>> Handle(RecentBankTransactionsQuery request, CancellationToken cancellationToken)
    {
        // Get recent bank details (transactions) ordered by date descending
        List<BankDetail> bankDetails = await bankDetailRepository
            .GetAll()
            .Where(bd => !bd.IsDeleted)
            .OrderByDescending(bd => bd.Date)
            .Take(10) // Get last 10 transactions
            .ToListAsync(cancellationToken);

        // Get all banks to map bank names
        List<Bank> banks = await bankRepository
            .GetAll()
            .Where(b => !b.IsDeleted)
            .ToListAsync(cancellationToken);

        // Create a dictionary for quick lookup
        var bankDictionary = banks.ToDictionary(b => b.Id, b => b.Name);

        // Convert to DTOs
        List<RecentBankTransactionDto> result = bankDetails
            .Select(bd => new RecentBankTransactionDto
            {
                BankName = bankDictionary.ContainsKey(bd.BankId) ? bankDictionary[bd.BankId] : "Bilinmeyen Banka",
                Date = bd.Date,
                Description = bd.Description,
                DepositAmount = bd.DepositAmount,
                WithdrawalAmount = bd.WithdrawalAmount,
                Balance = bd.DepositAmount - bd.WithdrawalAmount
            })
            .ToList();

        return result;
    }
}