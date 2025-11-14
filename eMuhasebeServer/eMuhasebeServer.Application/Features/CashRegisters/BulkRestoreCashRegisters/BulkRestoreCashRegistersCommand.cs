using MediatR;
using TS.Result;

namespace eMuhasebeServer.Application.Features.CashRegisters.BulkRestoreCashRegisters;

public sealed record BulkRestoreCashRegistersCommand(List<Guid> Ids) : IRequest<Result<string>>;