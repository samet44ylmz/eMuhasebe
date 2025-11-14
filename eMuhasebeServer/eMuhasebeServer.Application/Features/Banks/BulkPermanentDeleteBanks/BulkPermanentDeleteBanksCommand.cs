using MediatR;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Banks.BulkPermanentDeleteBanks;

public sealed record BulkPermanentDeleteBanksCommand(List<Guid> Ids) : IRequest<Result<string>>;