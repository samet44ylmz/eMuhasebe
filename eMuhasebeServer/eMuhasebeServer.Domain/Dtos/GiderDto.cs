namespace eMuhasebeServer.Domain.Dtos;

public sealed record GiderDto(
    Guid Id,
    string Name,
    DateOnly Date,
    int CategoryType,
    string Description,
    decimal Price,
    Guid? CashRegisterDetailId,
    decimal PaidAmount,
    int GiderCurrencyTypeValue
);
