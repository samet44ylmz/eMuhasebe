using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Employees.UpdateEmployee;

public sealed record  UpdateEmployeeCommand(
    Guid Id,
    string? Name,
    string? Address,
    string? IdentityNumber,
    string? Phone,
    string? Department,
    string? Position,
    decimal Salary,
    DateOnly? StartDate = null,
    int WorkDays = 30) : IRequest<Result<string>>;