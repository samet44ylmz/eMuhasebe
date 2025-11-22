using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using MediatR;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Giderler.CreateGider;

public sealed record CreateGiderCommand(
    string Name,
    DateOnly Date,
    int CategoryValue,
    int GiderCurrencyTypeValue,
    string Description,
    decimal Price,
    bool? IsCash,
    Guid? CashRegisterId
    // Added IsCash and CashRegisterId back to support cash register selection
) : IRequest<Result<string>>;