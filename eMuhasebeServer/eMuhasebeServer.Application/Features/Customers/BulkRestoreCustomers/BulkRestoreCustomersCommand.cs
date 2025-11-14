using MediatR;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Customers.BulkRestoreCustomers;

public sealed record BulkRestoreCustomersCommand(List<Guid> Ids) : IRequest<Result<string>>;