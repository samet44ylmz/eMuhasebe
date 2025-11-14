﻿using AutoMapper;
using eMuhasebeServer.Application.Services;
using eMuhasebeServer.Domain.Entities;
using eMuhasebeServer.Domain.Repositories;
using MediatR;
using TS.Result;
using GenericRepository;

namespace eMuhasebeServer.Application.Features.Customers.UpdateCustomer;

internal sealed class UpdateCustomerCommandHandler(
    ICustomerRepository customerRepository,
    IUnitOfWork unitOfWork,
    IMapper mapper,
    ICacheService cacheService) : IRequestHandler<UpdateCustomerCommand, Result<string>>
{
    public async Task<Result<string>> Handle(UpdateCustomerCommand request, CancellationToken cancellationToken)
    {
       Customer? customer = await customerRepository.GetByExpressionWithTrackingAsync(p => p.Id == request.Id, cancellationToken);
        if (customer is null)
        {
            return Result<string>.Failure("Cari bulunamadı");
        }
        mapper.Map(request, customer);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        cacheService.Remove(cacheService.GetCompanyCacheKey("customers"));
        return "Cari  başarıyla güncellendi";
        
    }
}

