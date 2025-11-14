using MediatR;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Employees.DeleteEmployeeById;

public sealed record DeleteEmployeeByIdCommand(
    Guid Id) : IRequest<Result<string>>;
