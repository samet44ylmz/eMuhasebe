using eMuhasebeServer.Domain.Entities;
using eMuhasebeServer.Domain.Repositories;
using eMuhasebeServer.Infrastructure.Context;
using GenericRepository;

namespace eMuhasebeServer.Infrastructure.Repositories;

internal sealed class EmployeeDetailRepository : Repository<EmployeeDetail, ApplicationDbContext>, IEmployeeDetailRespository
{
    public EmployeeDetailRepository(ApplicationDbContext context) : base(context)
    {
    }
}