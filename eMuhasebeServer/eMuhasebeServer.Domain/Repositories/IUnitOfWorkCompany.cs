using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eMuhasebeServer.Domain.Repositories
{
    public interface IUnitOfWorkCompany
    {
        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}
