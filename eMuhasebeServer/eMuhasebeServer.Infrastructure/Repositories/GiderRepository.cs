using eMuhasebeServer.Domain.Entities;
using eMuhasebeServer.Domain.Repositories;
using eMuhasebeServer.Infrastructure.Context;
using GenericRepository;

namespace eMuhasebeServer.Infrastructure.Repositories;

internal sealed class GiderRepository : Repository<Gider, ApplicationDbContext>, IGiderRepository
{
    public GiderRepository(ApplicationDbContext context) : base(context)
    {
    }
}