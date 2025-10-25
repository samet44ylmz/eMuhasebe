using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eMuhasebeServer.Domain.Entities;

public sealed class CompanyUser
{
    public Guid CompanyId { get; set; }
    public Company? Company{ get; set; }
    public Guid AppUserId { get; set; }

}
