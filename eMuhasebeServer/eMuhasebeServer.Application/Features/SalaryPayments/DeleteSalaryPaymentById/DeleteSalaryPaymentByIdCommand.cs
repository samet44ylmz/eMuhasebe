using MediatR;
using TS.Result;

namespace eMuhasebeServer.Application.Features.SalaryPayments.DeleteSalaryPaymentById;

public sealed record DeleteSalaryPaymentByIdCommand(Guid Id) : IRequest<Result<string>>;
