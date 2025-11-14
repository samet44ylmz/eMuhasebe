using eMuhasebeServer.Domain.Entities;
using eMuhasebeServer.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Reports.RecentCashTransactions;

internal sealed class RecentCashTransactionsQueryHandler(
    ICashRegisterDetailRepository cashRegisterDetailRepository,
    ICashRegisterRepository cashRegisterRepository) : IRequestHandler<RecentCashTransactionsQuery, Result<List<RecentCashTransactionDto>>>
{
    public async Task<Result<List<RecentCashTransactionDto>>> Handle(RecentCashTransactionsQuery request, CancellationToken cancellationToken)
    {
        // Get recent cash register details (transactions) ordered by date descending
        List<CashRegisterDetail> cashDetails = await cashRegisterDetailRepository
            .GetAll()
            .Where(cd => !cd.IsDeleted)
            .OrderByDescending(cd => cd.Date)
            .Take(10) // Get last 10 transactions
            .ToListAsync(cancellationToken);

        // Get all cash registers to map cash register names
        List<CashRegister> cashRegisters = await cashRegisterRepository
            .GetAll()
            .Where(cr => !cr.IsDeleted)
            .ToListAsync(cancellationToken);

        // Create a dictionary for quick lookup
        var cashRegisterDictionary = cashRegisters.ToDictionary(cr => cr.Id, cr => cr.Name);

        // Convert to DTOs
        List<RecentCashTransactionDto> result = cashDetails
            .Select(cd => new RecentCashTransactionDto
            {
                CashRegisterName = cashRegisterDictionary.ContainsKey(cd.CashRegisterId) ? cashRegisterDictionary[cd.CashRegisterId] : "Bilinmeyen Kasa",
                Date = cd.Date,
                Description = cd.Description,
                DepositAmount = cd.DepositAmount,
                WithdrawalAmount = cd.WithdrawalAmount,
                Balance = cd.DepositAmount - cd.WithdrawalAmount
            })
            .ToList();

        return result;
    }
}