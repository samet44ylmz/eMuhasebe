using MediatR;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Employees.BulkRestoreEmployees;

public sealed record BulkRestoreEmployeesCommand(List<Guid> Ids) : IRequest<Result<string>>;