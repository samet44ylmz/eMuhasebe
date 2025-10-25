using eMuhasebeServer.Application.Services;
using eMuhasebeServer.Domain.Entities;
using eMuhasebeServer.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eMuhasebeServer.Infrastructure.Services;

internal sealed class CompanyService : ICompanyService
{
    public void MigrateAll(List<Company> companies)
    {
        foreach (var company in companies)
        {
            CompanyDbContext context = new(company);

            context.Database.Migrate();
        }
    }
}

