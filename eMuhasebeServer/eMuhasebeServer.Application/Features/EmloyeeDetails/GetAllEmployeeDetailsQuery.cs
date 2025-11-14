using eMuhasebeServer.Domain.Entities;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TS.Result;

namespace eMuhasebeServer.Application.Features.EmloyeeDetails;

public sealed record GetAllEmployeeDetailsQuery(
   Guid EmployeeId) : IRequest<Result<EmployeeDetails>>;




