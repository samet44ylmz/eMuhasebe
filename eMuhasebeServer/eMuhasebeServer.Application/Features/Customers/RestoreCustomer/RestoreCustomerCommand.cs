using MediatR;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Customers.RestoreCustomer;

public sealed record RestoreCustomerCommand(Guid Id) : IRequest<Result<string>>;