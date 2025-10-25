using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TS.Result;

namespace eMuhasebeServer.Application.Features.BankDetails.CreateBankDetail;

public sealed record CreateBankDetailCommand(
    Guid BankId,
    DateOnly Date,
    int Type,
    decimal Amount,
    Guid? OppositeBankId,
    Guid? OppositeCashRegisterId,
    Guid? OppositeCustomerId,
    decimal OppositeAmount,
    string Description) : IRequest<Result<string>>;
