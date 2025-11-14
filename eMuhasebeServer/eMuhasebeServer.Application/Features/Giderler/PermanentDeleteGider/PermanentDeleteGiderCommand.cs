using MediatR;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Giderler.PermanentDeleteGider;

public sealed record PermanentDeleteGiderCommand(Guid Id) : IRequest<Result<string>>;