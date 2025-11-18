using eMuhasebeServer.Application.Services;
using eMuhasebeServer.Domain.Entities;
using eMuhasebeServer.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Customers.GetAllCustomers;

internal sealed class GetAllCustomersQueryHandler(
    ICustomerRepository customerRepository,
    ICacheService cacheService) : IRequestHandler<GetAllCustomersQuery, Result<List<Customer>>>
{
    public async Task<Result<List<Customer>>> Handle(GetAllCustomersQuery request, CancellationToken cancellationToken)
    {
        string cacheKey = cacheService.GetCompanyCacheKey("customers");
        List<Customer>? customers = cacheService.Get<List<Customer>>(cacheKey);

        if (customers is null)
        {
            customers = await customerRepository.GetAll().OrderBy(p => p.Name).ToListAsync(cancellationToken);
            cacheService.Set(cacheKey, "customers");
        }

        return customers;

    }
}

