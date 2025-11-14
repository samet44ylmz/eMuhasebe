using eMuhasebeServer.Application.Services;
using eMuhasebeServer.Domain.Entities;
using eMuhasebeServer.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Customers.GetAllDeletedCustomers;

internal sealed class GetAllDeletedCustomersQueryHandler(
    ICustomerRepository customerRepository) : IRequestHandler<GetAllDeletedCustomersQuery, Result<List<Customer>>>
{
    public async Task<Result<List<Customer>>> Handle(GetAllDeletedCustomersQuery request, CancellationToken cancellationToken)
    {
        // IgnoreQueryFilters() ile query filter'ı bypass ediyoruz (IsDeleted filter'ını devre dışı bırakıyoruz)
        List<Customer> customers = await customerRepository
            .GetAll()
            .IgnoreQueryFilters()
            .Where(p => p.IsDeleted == true)
            .OrderBy(p => p.Name)
            .ToListAsync(cancellationToken);

        return customers;
    }
}