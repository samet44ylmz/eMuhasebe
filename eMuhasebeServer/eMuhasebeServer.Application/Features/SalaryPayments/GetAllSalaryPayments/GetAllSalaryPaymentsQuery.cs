using eMuhasebeServer.Domain.Entities;
using MediatR;
using TS.Result;

namespace eMuhasebeServer.Application.Features.SalaryPayments.GetAllSalaryPayments;

public sealed record GetAllSalaryPaymentsQuery() : IRequest<Result<List<SalaryPayment>>>;
