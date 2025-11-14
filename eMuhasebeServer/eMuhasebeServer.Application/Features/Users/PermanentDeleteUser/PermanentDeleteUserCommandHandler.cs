using eMuhasebeServer.Application.Services;
using eMuhasebeServer.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Users.PermanentDeleteUser;

internal sealed class PermanentDeleteUserCommandHandler(
    ICacheService cacheService,
    UserManager<AppUser> userManager) : IRequestHandler<PermanentDeleteUserCommand, Result<string>>
{
    public async Task<Result<string>> Handle(PermanentDeleteUserCommand request, CancellationToken cancellationToken)
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
            return Result<string>.Failure("Önce kullanıcıyı silmeniz gerekir");
        }

        IdentityResult identityResult = await userManager.DeleteAsync(appUser);

        if (!identityResult.Succeeded)
        {
            return Result<string>.Failure(identityResult.Errors.Select(s => s.Description).ToList());
        }

        cacheService.Remove(cacheService.GetCompanyCacheKey("users"));

        return "Kullanıcı kalıcı olarak silindi";
    }
}

