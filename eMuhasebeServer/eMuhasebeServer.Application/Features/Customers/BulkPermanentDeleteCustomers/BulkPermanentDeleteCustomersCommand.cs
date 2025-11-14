using MediatR;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Customers.BulkPermanentDeleteCustomers;

public sealed record BulkPermanentDeleteCustomersCommand(List<Guid> Ids) : IRequest<Result<string>>;