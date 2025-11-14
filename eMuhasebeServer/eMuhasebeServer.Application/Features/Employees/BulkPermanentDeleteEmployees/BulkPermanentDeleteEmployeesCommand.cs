using MediatR;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Employees.BulkPermanentDeleteEmployees;

public sealed record BulkPermanentDeleteEmployeesCommand(List<Guid> Ids) : IRequest<Result<string>>;