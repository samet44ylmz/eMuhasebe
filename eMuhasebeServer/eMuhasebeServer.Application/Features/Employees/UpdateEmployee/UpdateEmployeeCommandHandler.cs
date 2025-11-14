﻿﻿using AutoMapper;
using eMuhasebeServer.Application.Services;
using eMuhasebeServer.Domain.Entities;
using eMuhasebeServer.Domain.Repositories;
using GenericRepository;
using MediatR;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Employees.UpdateEmployee;

internal sealed class UpdateEmployeeCommandHandler(
    ICacheService cacheService,
    IEmployeeRepository employeeRepository,
    IUnitOfWork unitOfWork,
    IMapper mapper) : IRequestHandler<UpdateEmployeeCommand, Result<string>>
{
    public async Task<Result<string>> Handle(UpdateEmployeeCommand request, CancellationToken cancellationToken)
    {
        EmployeeDetails employee = await employeeRepository.GetByExpressionWithTrackingAsync(p => p.Id == request.Id, cancellationToken);

        if (employee is null)
        {
           return Result<string>.Failure("Çalışan bulunamadı");
        }

        if (employee.IdentityNumber != request.IdentityNumber)
        {
            bool isIdentityNumberExists = await employeeRepository.AnyAsync(p => p.IdentityNumber == request.IdentityNumber, cancellationToken);
            if (isIdentityNumberExists)
            {
                return Result<string>.Failure("Bu kimlik numarası daha önce kaydedilmiş");
            }
        }

        mapper.Map(request, employee);
        
        // WorkDays is mapped automatically through AutoMapper
        // Salary property stores the base monthly salary

        await unitOfWork.SaveChangesAsync(cancellationToken);
        cacheService.Remove(cacheService.GetCompanyCacheKey("employees"));
        return "Çalışan bilgisi başarıyla güncellendi";
    }
}