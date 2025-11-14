﻿using eMuhasebeServer.Application.Services;
using eMuhasebeServer.Domain.Entities;
using eMuhasebeServer.Domain.Repositories;
using GenericRepository;
using MediatR;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Employees.DeleteEmployeeById;

internal sealed class DeleteEmployeeByIdCommandHandler(
    ICacheService cacheService,
    IEmployeeRepository employeeRepository,
    IUnitOfWork unitOfWork) : IRequestHandler<DeleteEmployeeByIdCommand, Result<string>>
{
    public async Task<Result<string>> Handle(DeleteEmployeeByIdCommand request, CancellationToken cancellationToken)
    {
         EmployeeDetails employee = await employeeRepository.GetByExpressionWithTrackingAsync(p => p.Id == request.Id, cancellationToken);
        if (employee is null)
        {
            return Result<string>.Failure("Çalışan bulunamadı");
        }
        employee.IsDeleted = true;
        employeeRepository.Update(employee); // Add this line to properly update the entity
        await unitOfWork.SaveChangesAsync(cancellationToken);
        cacheService.Remove(cacheService.GetCompanyCacheKey("employees"));
        return "Çalışan başarıyla silindi";
    }
}