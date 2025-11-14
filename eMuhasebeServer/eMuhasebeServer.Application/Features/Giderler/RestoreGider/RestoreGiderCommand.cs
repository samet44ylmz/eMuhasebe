using MediatR;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Giderler.RestoreGider;

public sealed record RestoreGiderCommand(Guid Id) : IRequest<Result<string>>;