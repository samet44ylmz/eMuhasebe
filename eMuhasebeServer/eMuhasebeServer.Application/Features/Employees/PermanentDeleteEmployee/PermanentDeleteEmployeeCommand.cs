using MediatR;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Employees.PermanentDeleteEmployee;

public sealed record PermanentDeleteEmployeeCommand(Guid Id) : IRequest<Result<string>>;