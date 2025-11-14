using MediatR;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Customers.PermanentDeleteCustomer;

public sealed record PermanentDeleteCustomerCommand(Guid Id) : IRequest<Result<string>>;