using eMuhasebeServer.Domain.Entities;
using MediatR;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Users.GetAllDeletedUsers;

public sealed record GetAllDeletedUsersQuery() : IRequest<Result<List<AppUser>>>;

