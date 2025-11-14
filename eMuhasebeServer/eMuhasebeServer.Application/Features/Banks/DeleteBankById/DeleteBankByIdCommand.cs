using MediatR;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Banks.DeleteBankById;

public sealed record DeleteBankByIdCommand(
    Guid Id) : IRequest<Result<string>>;
