using AutoMapper;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Auth.SendConfirmEmail;

    public sealed record SendConfirmEmailCommand(
        string Email) : IRequest<Result<string>>;
