using eMuhasebeServer.Domain.Abstractions;
using eMuhasebeServer.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eMuhasebeServer.Domain.Entities;

public sealed class Gider : Entity
{
    public string Name { get; set; } = string.Empty;
    public GiderCurrencyTypeEnum GiderCurrencyType { get; set; } = GiderCurrencyTypeEnum.TL;
    public DateOnly Date { get; set; }
    public GiderCategoryTypeEnum CategoryType { get; set; } = GiderCategoryTypeEnum.Malzeme;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public Guid? CashRegisterDetailId { get; set; }
    // Add paid amount tracking
    public decimal PaidAmount { get; set; } = 0;
}