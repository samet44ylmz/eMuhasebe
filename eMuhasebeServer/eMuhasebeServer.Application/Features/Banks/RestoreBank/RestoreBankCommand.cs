using MediatR;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Banks.RestoreBank;

public sealed record RestoreBankCommand(Guid Id) : IRequest<Result<string>>;