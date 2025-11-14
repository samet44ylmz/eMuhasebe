using MediatR;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Users.PermanentDeleteUser;

public sealed record PermanentDeleteUserCommand(Guid Id) : IRequest<Result<string>>;

