using eMuhasebeServer.Domain.Entities;
using MediatR;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Customers.GetAllCustomers;

public sealed record GetAllCustomersQuery() : IRequest<Result<List<Customer>>>;

