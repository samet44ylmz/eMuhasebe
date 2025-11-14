using eMuhasebeServer.Domain.Entities;
using eMuhasebeServer.Domain.Repositories;
using eMuhasebeServer.Infrastructure.Context;
using GenericRepository;

namespace eMuhasebeServer.Infrastructure.Repositories;

internal sealed class BankRepository : Repository<Bank, ApplicationDbContext>, IBankRepository
{
    public BankRepository(ApplicationDbContext context) : base(context)
    {
    }
}