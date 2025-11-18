using eMuhasebeServer.Application.Services;
using eMuhasebeServer.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Users.GetAllUsers;

internal sealed class GetAllUsersQueryHandler(
    ICacheService cacheService,
    UserManager<AppUser> userManager) : IRequestHandler<GetAllUsersQuery, Result<List<AppUser>>>
{
    public async Task<Result<List<AppUser>>> Handle(GetAllUsersQuery request, CancellationToken cancellationToken)
    {
        List<AppUser>? users;

        string cacheKey = cacheService.GetCompanyCacheKey("users");
        users = cacheService.Get<List<AppUser>>(cacheKey);

        if (users == null)
        {

            users =
            await userManager.Users
            .Where(p => p.IsDeleted == false)
           
           
            .OrderBy(p => p.FirstName)
            .ToListAsync(cancellationToken);

            cacheService.Set(cacheKey, "users");
        }

        return users;
    }
}
 