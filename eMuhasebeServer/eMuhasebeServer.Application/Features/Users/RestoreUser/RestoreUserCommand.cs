using MediatR;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Users.RestoreUser;

public sealed record RestoreUserCommand(Guid Id) : IRequest<Result<string>>;

