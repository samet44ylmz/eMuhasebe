using eMuhasebeServer.Application.Services;
using eMuhasebeServer.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Users.BulkDeleteUsers;

internal sealed class BulkDeleteUsersCommandHandler(
    ICacheService cacheService,
    UserManager<AppUser> userManager) : IRequestHandler<BulkDeleteUsersCommand, Result<string>>
{
    public async Task<Result<string>> Handle(BulkDeleteUsersCommand request, CancellationToken cancellationToken)
    {
        int deletedCount = 0;

        foreach (var id in request.Ids)
        {
            // IgnoreQueryFilters() ile query filter'ı bypass ediyoruz (silinen kullanıcıları bulabilmek için)
            AppUser? appUser = await userManager.Users
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
            
            if (appUser != null && appUser.IsDeleted)
            {
                IdentityResult result = await userManager.DeleteAsync(appUser);
                if (result.Succeeded)
                {
                    deletedCount++;
                }
            }
        }

        cacheService.Remove(cacheService.GetCompanyCacheKey("users"));

        return $"{deletedCount} kullanıcı kalıcı olarak silindi";
    }
}

