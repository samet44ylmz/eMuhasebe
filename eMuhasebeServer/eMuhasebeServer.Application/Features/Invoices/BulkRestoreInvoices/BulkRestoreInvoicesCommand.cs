using MediatR;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Invoices.BulkRestoreInvoices;

public sealed record BulkRestoreInvoicesCommand(List<Guid> Ids) : IRequest<Result<string>>;