using eMuhasebeServer.Application.Services;
using eMuhasebeServer.Domain.Entities;
using eMuhasebeServer.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Employees.GetAllEmployees;

internal sealed class GetAllEmployeeQueryHandler(
    IEmployeeRepository employeeRepository,
    ICacheService cacheService) : IRequestHandler<GetAllEmployeesQuery, Result<List<EmployeeDetails>>>
{
    public async Task<Result<List<EmployeeDetails>>> Handle(GetAllEmployeesQuery request, CancellationToken cancellationToken)
    {
        List<EmployeeDetails>? employees;
        string cacheKey = cacheService.GetCompanyCacheKey("employees");
        employees = cacheService.Get<List<EmployeeDetails>>(cacheKey);
        if (employees == null)
        {
            employees =
             await employeeRepository
             .GetAll()
             .OrderBy(p => p.Name)
             .ToListAsync(cancellationToken);

            cacheService.Set(cacheKey, employees);
        }

        return employees;
    }
}
