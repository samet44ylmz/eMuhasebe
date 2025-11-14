using eMuhasebeServer.Domain.Entities;
using MediatR;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Employees.GetAllEmployees;

public sealed record GetAllEmployeesQuery() : IRequest<Result<List<EmployeeDetails>>>;
