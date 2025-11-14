using eMuhasebeServer.Domain.Entities;
using MediatR;
using TS.Result;

namespace eMuhasebeServer.Application.Features.SalaryPayments.GetSalaryPaymentsByEmployeeId;

public sealed record GetSalaryPaymentsByEmployeeIdQuery(string EmployeeId) : IRequest<Result<List<SalaryPayment>>>;