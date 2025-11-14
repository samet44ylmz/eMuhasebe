using MediatR;
using TS.Result;

namespace eMuhasebeServer.Application.Features.CashRegisters.PermanentDeleteCashRegister;

public sealed record PermanentDeleteCashRegisterCommand(Guid Id) : IRequest<Result<string>>;