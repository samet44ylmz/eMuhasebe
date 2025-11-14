using eMuhasebeServer.Application.Services;
using eMuhasebeServer.Domain.Entities;
using eMuhasebeServer.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Employees.GetAllDeletedEmployees;

internal sealed class GetAllDeletedEmployeesQueryHandler(
    IEmployeeRepository employeeRepository) : IRequestHandler<GetAllDeletedEmployeesQuery, Result<List<EmployeeDetails>>>
{
    public async Task<Result<List<EmployeeDetails>>> Handle(GetAllDeletedEmployeesQuery request, CancellationToken cancellationToken)
    {
        // IgnoreQueryFilters() ile query filter'ı bypass ediyoruz (IsDeleted filter'ını devre dışı bırakıyoruz)
        List<EmployeeDetails> employees = await employeeRepository
            .GetAll()
            .IgnoreQueryFilters()
            .Where(p => p.IsDeleted == true)
            .OrderBy(p => p.Name)
            .ToListAsync(cancellationToken);

        return employees;
    }
}