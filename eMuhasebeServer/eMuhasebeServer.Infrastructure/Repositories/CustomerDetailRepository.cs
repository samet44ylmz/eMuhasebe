using eMuhasebeServer.Domain.Entities;
using eMuhasebeServer.Domain.Repositories;
using eMuhasebeServer.Infrastructure.Context;
using GenericRepository;

namespace eMuhasebeServer.Infrastructure.Repositories;

internal sealed class CustomerDetailRepository : Repository<CustomerDetail, ApplicationDbContext>, ICustomerDetailRepository
{
    public CustomerDetailRepository(ApplicationDbContext context) : base(context)
    {
    }
}