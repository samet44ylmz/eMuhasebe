using MediatR;
using TS.Result;

namespace eMuhasebeServer.Application.Features.BankDetails.DeleteBankById;

public sealed record DeleteBankDetailByIdCommand(
    Guid Id) : IRequest <Result<string>>;
