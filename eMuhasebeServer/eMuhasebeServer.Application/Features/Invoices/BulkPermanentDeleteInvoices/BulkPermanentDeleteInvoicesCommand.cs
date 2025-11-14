using MediatR;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Invoices.BulkPermanentDeleteInvoices;

public sealed record BulkPermanentDeleteInvoicesCommand(List<Guid> Ids) : IRequest<Result<string>>;