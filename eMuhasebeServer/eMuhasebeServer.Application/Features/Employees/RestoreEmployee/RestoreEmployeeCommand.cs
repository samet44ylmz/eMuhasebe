using MediatR;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Employees.RestoreEmployee;

public sealed record RestoreEmployeeCommand(Guid Id) : IRequest<Result<string>>;