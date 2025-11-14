using MediatR;
using TS.Result;

namespace eMuhasebeServer.Application.Features.CashRegisters.RestoreCashRegister;

public sealed record RestoreCashRegisterCommand(Guid Id) : IRequest<Result<string>>;