using eMuhasebeServer.Domain.Entities;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Users.GetAllUsers;
 public sealed record GetAllUsersQuery() : IRequest<Result<List<AppUser>>>;
 