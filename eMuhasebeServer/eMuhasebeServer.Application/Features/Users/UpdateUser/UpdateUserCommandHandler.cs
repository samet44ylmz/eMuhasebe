using AutoMapper;
using System.Linq;
using eMuhasebeServer.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using TS.Result;
// using eMuhasebeServer.Domain.Events;
using eMuhasebeServer.Application.Services;
using GenericRepository;

namespace eMuhasebeServer.Application.Features.Users.UpdateUser
{
    internal sealed class UpdateUserCommandHandler(
        ICacheService cacheService,
        // IMediator mediator,
        UserManager<AppUser> userManager,
        IUnitOfWork unitOfWork,
        IMapper mapper) : IRequestHandler<UpdateUserCommand, Result<string>>
    {
        public async Task<Result<string>> Handle(UpdateUserCommand request, CancellationToken cancellationToken)
        {
            AppUser? appUser = await userManager.Users
                .Where(p => p.Id == request.Id)
                .FirstOrDefaultAsync(cancellationToken);
            // bool isEmailChanged = false;

            if (appUser is null)
            {
                return Result<string>.Failure("Kullanıcı bulunamadı");
            }

            // Check if username is being changed and if it already exists
            if (request.UserName != null && appUser.UserName != request.UserName)
            {
                bool isUserNameExists = await userManager.Users.AnyAsync(p => p.UserName == request.UserName, cancellationToken);

                if (isUserNameExists)
                {
                    return Result<string>.Failure("Bu kullanıcı adı daha önce kullanılmış");
                }
            }

            // Check if email is being changed and if it already exists
            if (request.Email != null && appUser.Email != request.Email)
            {
                bool isEmailExists = await userManager.Users.AnyAsync(p => p.Email == request.Email, cancellationToken);
                if (isEmailExists)
                {
                    return Result<string>.Failure("Bu mail adresi daha önce kullanılmış");
                }
                // isEmailChanged = true;
                // appUser.EmailConfirmed = false;
            }

            // Always map and update the user, regardless of whether username has changed
            mapper.Map(request, appUser);

            IdentityResult identityResult = await userManager.UpdateAsync(appUser);

            if (!identityResult.Succeeded)
            {
                return Result<string>.Failure(identityResult.Errors.Select(s => s.Description).ToList());
            }

            // Update password if provided
            if (request.Password is not null)
            {
                string token = await userManager.GeneratePasswordResetTokenAsync(appUser);
                identityResult = await userManager.ResetPasswordAsync(appUser, token, request.Password);
                if (!identityResult.Succeeded)
                {
                    return Result<string>.Failure(identityResult.Errors.Select(s => s.Description).ToList());
                }
            }

            await unitOfWork.SaveChangesAsync(cancellationToken);

            cacheService.Remove("users");

            // if (isEmailChanged)
            // {
            //     await mediator.Publish(new AppUserEvent(appUser.Id));
            // }
            
            return ("Kullanıcı başarıyla güncellendi");
        }
    }
}