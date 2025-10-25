using GenericRepository;
using eMuhasebeServer.Domain.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eMuhasebeServer.Domain.Repositories;

    public interface ICompanyRepository : IRepository<Entities.Company>
    {
    }