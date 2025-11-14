using MediatR;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Giderler.BulkRestoreGiderler;

public sealed record BulkRestoreGiderlerCommand(List<Guid> Ids) : IRequest<Result<string>>;