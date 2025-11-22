using Ardalis.SmartEnum;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eMuhasebeServer.Domain.Enums;

public sealed class GiderCurrencyTypeEnum : SmartEnum<GiderCurrencyTypeEnum>
{
    public static readonly GiderCurrencyTypeEnum TL = new("TL", 1);
    public static readonly GiderCurrencyTypeEnum USD = new("USD", 2);
    public static readonly GiderCurrencyTypeEnum EUR = new("EUR", 3);
    public GiderCurrencyTypeEnum(string name, int value) : base(name, value)
    {
    }
}
