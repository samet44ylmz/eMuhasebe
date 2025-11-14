using eMuhasebeServer.Domain.Entities;
using MediatR;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Customers.GetAllDeletedCustomers;

public sealed record GetAllDeletedCustomersQuery() : IRequest<Result<List<Customer>>>;