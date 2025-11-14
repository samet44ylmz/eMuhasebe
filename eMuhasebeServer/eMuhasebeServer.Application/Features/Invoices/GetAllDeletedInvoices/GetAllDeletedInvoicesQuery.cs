using eMuhasebeServer.Domain.Entities;
using MediatR;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Invoices.GetAllDeletedInvoices;

public sealed record GetAllDeletedInvoicesQuery() : IRequest<Result<List<Invoice>>>;