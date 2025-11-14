using MediatR;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Giderler.PayExpense;

public sealed record PayExpenseCommand(
    Guid ExpenseId,
    decimal PaymentAmount,
    DateOnly PaymentDate,
    string Description,
    Guid? CashRegisterId) : IRequest<Result<string>>;