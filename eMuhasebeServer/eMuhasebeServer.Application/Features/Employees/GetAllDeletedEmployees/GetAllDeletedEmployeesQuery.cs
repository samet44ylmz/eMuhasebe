using eMuhasebeServer.Domain.Entities;
using MediatR;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Employees.GetAllDeletedEmployees;

public sealed record GetAllDeletedEmployeesQuery() : IRequest<Result<List<EmployeeDetails>>>;