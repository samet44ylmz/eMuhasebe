﻿using AutoMapper;
using eMuhasebeServer.Application.Services;
using eMuhasebeServer.Domain.Entities;
using eMuhasebeServer.Domain.Repositories;
using GenericRepository;
using MediatR;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Employees.CreateEmployee;

internal sealed class CreateEmployeeComandHandler(
    IEmployeeRepository employeeRepository,
    ICacheService cacheService,
    IUnitOfWork unitOfWork,
    IMapper mapper) : IRequestHandler<CreateEmployeeCommand, Result<string>>
{
    public async Task<Result<string>> Handle(CreateEmployeeCommand request, CancellationToken cancellationToken)
    {
        bool isIdentityNumberExists = await employeeRepository.AnyAsync(p => p.IdentityNumber == request.IdentityNumber, cancellationToken);

        if (isIdentityNumberExists)
        {
            return Result<string>.Failure("Bu Tc kimlik numarası ile bir çalışan zaten mevcut");
        }

        EmployeeDetails employee = mapper.Map<EmployeeDetails>(request);
        
        // The Salary property stores the base monthly salary as entered
        // When creating salary payments, the system will calculate:
        // Daily Rate = Monthly Salary / 30
        // Actual Salary = Daily Rate * WorkDays

        await employeeRepository.AddAsync(employee, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        cacheService.Remove(cacheService.GetCompanyCacheKey("employees"));
        return "Çalışan başarıyla oluşturuldu";
    }
}