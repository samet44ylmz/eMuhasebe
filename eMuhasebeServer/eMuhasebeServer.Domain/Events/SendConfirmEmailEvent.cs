﻿using eMuhasebeServer.Domain.Entities;
using FluentEmail.Core;
using MediatR;
using Microsoft.AspNetCore.Identity;
using System.Threading;
using System;

namespace eMuhasebeServer.Domain.Events
{
    public sealed class SendConfirmEmailEvent(
        UserManager<AppUser> userManager,
        IFluentEmail fluentEmail) : INotificationHandler<AppUserEvent>
    {
        public async Task Handle(AppUserEvent notification, CancellationToken cancellationToken)
        {
            AppUser? appUser = await userManager.FindByIdAsync(notification.UserId.ToString());
            if (appUser is not null)
            {
                await fluentEmail
                    .To(appUser.Email)
                    .Subject("Mail Onayı")
                    .Body(CreateBody(appUser), true)
                    .SendAsync(cancellationToken);
            }
        }

        private string CreateBody(AppUser appUser)
        {
            string safeEmail = Uri.EscapeDataString(appUser.Email ?? string.Empty);
            string body = $@"
            Mail adresinizi onaylamak için aşağıdaki linke tıklayın.
                          <a href=""http://localhost:4200/confirm-email/{safeEmail}"" target=""_blank"" rel=""noopener noreferrer"">Maili onaylamak için tıklayın</a>";


            return body;

        }
    }
}
