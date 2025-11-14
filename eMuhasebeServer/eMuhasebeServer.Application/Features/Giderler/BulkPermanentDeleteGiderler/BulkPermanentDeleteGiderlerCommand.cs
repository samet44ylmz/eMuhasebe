using MediatR;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Giderler.BulkPermanentDeleteGiderler;

public sealed record BulkPermanentDeleteGiderlerCommand(List<Guid> Ids) : IRequest<Result<string>>;