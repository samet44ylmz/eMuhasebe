using MediatR;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Invoices.PermanentDeleteInvoice;

public sealed record PermanentDeleteInvoiceCommand(Guid Id) : IRequest<Result<string>>;