using GenericRepository;
using MediatR;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Employees.CreateEmployee;

public sealed record CreateEmployeeCommand(
    string Name,
    string? Address,
    string IdentityNumber,
    string? Phone,
    string? Department,
    string? Position,
    decimal Salary,
    DateOnly? StartDate = null,
    int WorkDays = 30): IRequest<Result<string>>;