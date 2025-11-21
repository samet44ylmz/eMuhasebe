using MediatR;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Giderler.UpdateGider;

public sealed record UpdateGiderCommand(
    Guid Id,
    string Name,
    DateOnly Date,
    int CategoryValue,
    string Description,
    decimal Price,
    bool IsCash,
    Guid? CashRegisterId
) : IRequest<Result<string>>;