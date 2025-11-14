using eMuhasebeServer.Application.Services;
using eMuhasebeServer.Domain.Entities;
using eMuhasebeServer.Domain.Repositories;
using GenericRepository;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Employees.PermanentDeleteEmployee;

internal sealed class PermanentDeleteEmployeeCommandHandler(
    IEmployeeRepository employeeRepository,
    IUnitOfWork unitOfWork) : IRequestHandler<PermanentDeleteEmployeeCommand, Result<string>>
{
    public async Task<Result<string>> Handle(PermanentDeleteEmployeeCommand request, CancellationToken cancellationToken)
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
            return Result<string>.Failure("Önce çalışan kaydını silmeniz gerekir");
        }

        employeeRepository.Delete(employee);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return "Çalışan kaydı kalıcı olarak silindi";
    }
}