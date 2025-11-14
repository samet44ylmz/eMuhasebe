using MediatR;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Invoices.PayInvoice;

public sealed record PayInvoiceCommand(
    Guid InvoiceId,
    decimal PaymentAmount,
    DateOnly PaymentDate,
    string Description,
    Guid? CashRegisterId) : IRequest<Result<string>>;