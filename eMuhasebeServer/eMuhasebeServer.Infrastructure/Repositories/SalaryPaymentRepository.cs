using eMuhasebeServer.Domain.Entities;
using eMuhasebeServer.Domain.Repositories;
using eMuhasebeServer.Infrastructure.Context;
using GenericRepository;

namespace eMuhasebeServer.Infrastructure.Repositories;

internal sealed class SalaryPaymentRepository : Repository<SalaryPayment, ApplicationDbContext>, ISalaryPaymentRepository
{
    public SalaryPaymentRepository(ApplicationDbContext context) : base(context)
    {
    }
}