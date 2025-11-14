using eMuhasebeServer.Domain.Entities;
using eMuhasebeServer.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Reports.CashRegisterBalanceReports;

internal sealed class CashRegisterBalanceReportsQueryHandler(
    ICashRegisterRepository cashRegisterRepository) : IRequestHandler<CashRegisterBalanceReportsQuery, Result<List<CashRegisterBalanceDto>>>
{
    public async Task<Result<List<CashRegisterBalanceDto>>> Handle(CashRegisterBalanceReportsQuery request, CancellationToken cancellationToken)
    {
        // Get all cash registers with their balances
        List<CashRegister> cashRegisters = await cashRegisterRepository
            .GetAll()
            .Where(cr => !cr.IsDeleted)
            .ToListAsync(cancellationToken);

        // Calculate balance for each cash register (Deposit - Withdrawal)
        List<CashRegisterBalanceDto> result = cashRegisters
            .Select(cr => new CashRegisterBalanceDto
            {
                CashRegisterName = cr.Name,
                Balance = cr.DepositAmount - cr.WithdrawalAmount
            })
            .ToList();

        return result;
    }
}