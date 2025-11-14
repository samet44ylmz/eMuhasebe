using eMuhasebeServer.Application.Services;
using eMuhasebeServer.Domain.Entities;
using eMuhasebeServer.Domain.Repositories;
using GenericRepository;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Employees.RestoreEmployee;

internal sealed class RestoreEmployeeCommandHandler(
    IEmployeeRepository employeeRepository,
    IUnitOfWork unitOfWork,
    ICacheService cacheService) : IRequestHandler<RestoreEmployeeCommand, Result<string>>
{
    public async Task<Result<string>> Handle(RestoreEmployeeCommand request, CancellationToken cancellationToken)
    {
        // IgnoreQueryFilters() ile query filter'ı bypass ediyoruz (silinen çalışanları bulabilmek için)
        EmployeeDetails? employee = await employeeRepository
            .GetAll()
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

        if (employee is null)
        {
            return Result<string>.Failure("Çalışan bulunamadı");
        }

        if (!employee.IsDeleted)
        {
            return Result<string>.Failure("Çalışan zaten aktif");
        }

        employee.IsDeleted = false;
        employeeRepository.Update(employee);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        // Clear the employees cache to ensure restored employees appear in the list
        string cacheKey = cacheService.GetCompanyCacheKey("employees");
        cacheService.Remove(cacheKey);

        return "Çalışan kaydı başarıyla geri yüklendi";
    }
}