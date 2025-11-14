using MediatR;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Banks.PermanentDeleteBank;

public sealed record PermanentDeleteBankCommand(Guid Id) : IRequest<Result<string>>;