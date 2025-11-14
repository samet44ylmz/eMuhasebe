using eMuhasebeServer.Application.Services;
using eMuhasebeServer.Domain.Entities;
using eMuhasebeServer.Domain.Repositories;
using GenericRepository;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Employees.BulkPermanentDeleteEmployees;

internal sealed class BulkPermanentDeleteEmployeesCommandHandler(
    IEmployeeRepository employeeRepository,
    IUnitOfWork unitOfWork) : IRequestHandler<BulkPermanentDeleteEmployeesCommand, Result<string>>
{
    public async Task<Result<string>> Handle(BulkPermanentDeleteEmployeesCommand request, CancellationToken cancellationToken)
    {
        // IgnoreQueryFilters() ile query filter'ı bypass ediyoruz (silinen çalışanları bulabilmek için)
        List<EmployeeDetails> employees = await employeeRepository
            .GetAll()
            .IgnoreQueryFilters()
            .Where(p => request.Ids.Contains(p.Id) && p.IsDeleted)
            .ToListAsync(cancellationToken);

        if (employees.Count == 0)
        {
            return Result<string>.Failure("Silinecek çalışan bulunamadı");
        }

        employeeRepository.DeleteRange(employees);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return $"{employees.Count} çalışan kalıcı olarak silindi";
    }
}