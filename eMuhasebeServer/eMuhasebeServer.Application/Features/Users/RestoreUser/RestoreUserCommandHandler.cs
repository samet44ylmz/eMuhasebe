using eMuhasebeServer.Application.Services;
using eMuhasebeServer.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Users.RestoreUser;

internal sealed class RestoreUserCommandHandler(
    ICacheService cacheService,
    UserManager<AppUser> userManager) : IRequestHandler<RestoreUserCommand, Result<string>>
{
    public async Task<Result<string>> Handle(RestoreUserCommand request, CancellationToken cancellationToken)
    {
        // IgnoreQueryFilters() ile query filter'ı bypass ediyoruz (silinen kullanıcıları bulabilmek için)
        AppUser? appUser = await userManager.Users
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

        if (appUser is null)
        {
            return Result<string>.Failure("Kullanıcı bulunamadı");
        }

        if (!appUser.IsDeleted)
        {
            return Result<string>.Failure("Kullanıcı zaten aktif");
        }

        appUser.IsDeleted = false;
        IdentityResult identityResult = await userManager.UpdateAsync(appUser);

        if (!identityResult.Succeeded)
        {
            return Result<string>.Failure(identityResult.Errors.Select(s => s.Description).ToList());
        }

        cacheService.Remove(cacheService.GetCompanyCacheKey("users"));

        return "Kullanıcı başarıyla geri yüklendi";
    }
}

