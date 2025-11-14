using eMuhasebeServer.Domain.Dtos;
using MediatR;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Invoices.CreateInvoice;

public sealed record CreateInvoiceCommand(
    DateOnly Date,
    string? InvoiceNumber,  // Made optional
    Guid CustomerId,
    string Description,
    List<InvoiceDetailDto> Details) : IRequest<Result<string>>;