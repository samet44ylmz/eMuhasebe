using eMuhasebeServer.Domain.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eMuhasebeServer.Domain.Entities;

public sealed class ProductDetail : Entity
{
    public Guid ProductId { get; set; }
    public DateOnly Date {  get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Deposit { get; set; } 
    public decimal Withdrawal { get; set; } 
    public decimal Price { get; set; }
    public Guid? InvoiceId { get; set; }
}
