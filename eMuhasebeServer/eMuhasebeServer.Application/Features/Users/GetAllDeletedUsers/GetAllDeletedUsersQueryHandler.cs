using eMuhasebeServer.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Users.GetAllDeletedUsers;

internal sealed class GetAllDeletedUsersQueryHandler(
    UserManager<AppUser> userManager) : IRequestHandler<GetAllDeletedUsersQuery, Result<List<AppUser>>>
{
    public async Task<Result<List<AppUser>>> Handle(GetAllDeletedUsersQuery request, CancellationToken cancellationToken)
    {
        // IgnoreQueryFilters() ile query filter'ı bypass ediyoruz (IsDeleted filter'ını devre dışı bırakıyoruz)
        List<AppUser> users = await userManager.Users
            .IgnoreQueryFilters()
            .Where(p => p.IsDeleted == true)
          
           
            .OrderBy(p => p.FirstName)
            .ToListAsync(cancellationToken);

        return users;
    }
}

