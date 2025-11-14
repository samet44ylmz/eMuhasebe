using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TS.Result;

namespace eMuhasebeServer.Application.Features.CashRegisterDetails.DeleteCashRegisterById;

public sealed record DeleteCashRegisterDetailByIdCommand(
    Guid Id): IRequest <Result<string>>;


