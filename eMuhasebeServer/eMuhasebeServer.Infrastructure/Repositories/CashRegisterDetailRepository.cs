using eMuhasebeServer.Domain.Entities;
using eMuhasebeServer.Domain.Repositories;
using eMuhasebeServer.Infrastructure.Context;
using GenericRepository;

namespace eMuhasebeServer.Infrastructure.Repositories;

internal sealed class CashRegisterDetailRepository : Repository<CashRegisterDetail, ApplicationDbContext>, ICashRegisterDetailRepository
{
    public CashRegisterDetailRepository(ApplicationDbContext context) : base(context)
    {
    }
}