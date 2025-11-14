using MediatR;
using TS.Result;

namespace eMuhasebeServer.Application.Features.CashRegisters.BulkPermanentDeleteCashRegisters;

public sealed record BulkPermanentDeleteCashRegistersCommand(List<Guid> Ids) : IRequest<Result<string>>;