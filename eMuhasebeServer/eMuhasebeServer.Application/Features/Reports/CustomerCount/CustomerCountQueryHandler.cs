using eMuhasebeServer.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Reports.CustomerCount;

internal sealed class CustomerCountQueryHandler(
    ICustomerRepository customerRepository) : IRequestHandler<CustomerCountQuery, Result<int>>
{
    public async Task<Result<int>> Handle(CustomerCountQuery request, CancellationToken cancellationToken)
    {
        int count = await customerRepository
            .GetAll()
            .Where(c => !c.IsDeleted)
            .CountAsync(cancellationToken);

        return count;
    }
}