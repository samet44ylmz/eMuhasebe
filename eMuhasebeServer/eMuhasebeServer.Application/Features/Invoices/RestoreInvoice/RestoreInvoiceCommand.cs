using MediatR;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Invoices.RestoreInvoice;

public sealed record RestoreInvoiceCommand(Guid Id) : IRequest<Result<string>>;