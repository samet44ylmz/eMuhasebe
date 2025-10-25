using eMuhasebeServer.Domain.Abstractions;
using eMuhasebeServer.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eMuhasebeServer.Domain.Entities;

public sealed class CustomerDetail : Entity
{
    public Guid CustomerId { get; set; }
    public CustomerDetailTypeEnum Type { get; set; } = CustomerDetailTypeEnum.CashRegister;
    public DateOnly Date { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal DepositAmount { get; set; } //Giriş
    public decimal WithdrawalAmount { get; set; } //Çıkış
    public Guid? BankDetailId { get; set; }
    public Guid? CashRegisterId { get; set; }
    public Guid? InvoiceId { get; set; }

}
