using eMuhasebeServer.Application.Services;
using eMuhasebeServer.Domain.Entities;
using eMuhasebeServer.Domain.Repositories;
using GenericRepository;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Employees.BulkRestoreEmployees;

internal sealed class BulkRestoreEmployeesCommandHandler(
    IEmployeeRepository employeeRepository,
    IUnitOfWork unitOfWork,
    ICacheService cacheService) : IRequestHandler<BulkRestoreEmployeesCommand, Result<string>>
{
    public async Task<Result<string>> Handle(BulkRestoreEmployeesCommand request, CancellationToken cancellationToken)
    {
        // IgnoreQueryFilters() ile query filter'ı bypass ediyoruz (silinen çalışanları bulabilmek için)
        List<EmployeeDetails> employees = await employeeRepository
            .GetAll()
            .IgnoreQueryFilters()
            .Where(p => request.Ids.Contains(p.Id) && p.IsDeleted)
            .ToListAsync(cancellationToken);

        if (employees.Count == 0)
        {
            return Result<string>.Failure("Geri yüklenecek çalışan bulunamadı");
        }

        foreach (var employee in employees)
        {
            employee.IsDeleted = false;
            employeeRepository.Update(employee);
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);

        // Clear the employees cache to ensure restored employees appear in the list
        string cacheKey = cacheService.GetCompanyCacheKey("employees");
        cacheService.Remove(cacheKey);

        return $"{employees.Count} çalışan başarıyla geri yüklendi";
    }
}