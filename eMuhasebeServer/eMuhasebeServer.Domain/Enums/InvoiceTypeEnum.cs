﻿using Ardalis.SmartEnum;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eMuhasebeServer.Domain.Enums;

public sealed class InvoiceTypeEnum : SmartEnum<InvoiceTypeEnum>
{
    public static readonly InvoiceTypeEnum Purchase = new("Alış Faturası", 1);
    public static readonly InvoiceTypeEnum Selling = new("Satış Faturası", 2);
    public InvoiceTypeEnum(string name, int value) : base(name, value)
    {
    }
}
