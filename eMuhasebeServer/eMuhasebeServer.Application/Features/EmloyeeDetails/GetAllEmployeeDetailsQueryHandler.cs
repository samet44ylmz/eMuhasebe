using eMuhasebeServer.Domain.Entities;
using eMuhasebeServer.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TS.Result;

namespace eMuhasebeServer.Application.Features.EmloyeeDetails;

internal sealed class GetAllEmployeeDetailsQueryHandler(
    IEmployeeRepository employeeRepository) : IRequestHandler<GetAllEmployeeDetailsQuery, Result<EmployeeDetails>>
{
    public async Task<Result<EmployeeDetails>> Handle(GetAllEmployeeDetailsQuery request, CancellationToken cancellationToken)
    {
       EmployeeDetails? employee =
           await employeeRepository
               .Where(e => e.Id == request.EmployeeId)
               .Include(e => e.Details)
               .FirstOrDefaultAsync(cancellationToken);

        if (employee is null)
        {
            return Result<EmployeeDetails>.Failure("Çalışan Bulunamadı");
        }
        return employee;
    }
}




