using eMuhasebeServer.Domain.Entities;
using MediatR;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Invoices.GetAllInvoices;

public sealed record GetAllInvoicesQuery(
    int Type,
    DateOnly StartDate,
    DateOnly EndDate,
    Guid? CustomerId = null) : IRequest<Result<List<Invoice>>>;