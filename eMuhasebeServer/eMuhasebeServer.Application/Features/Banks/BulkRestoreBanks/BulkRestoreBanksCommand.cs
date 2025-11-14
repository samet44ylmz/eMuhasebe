using MediatR;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Banks.BulkRestoreBanks;

public sealed record BulkRestoreBanksCommand(List<Guid> Ids) : IRequest<Result<string>>;