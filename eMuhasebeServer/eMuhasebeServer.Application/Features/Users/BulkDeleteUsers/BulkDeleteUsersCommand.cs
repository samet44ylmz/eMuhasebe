using MediatR;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Users.BulkDeleteUsers;

public sealed record BulkDeleteUsersCommand(List<Guid> Ids) : IRequest<Result<string>>;

