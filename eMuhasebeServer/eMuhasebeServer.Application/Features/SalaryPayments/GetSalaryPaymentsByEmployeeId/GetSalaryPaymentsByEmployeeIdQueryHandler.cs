using eMuhasebeServer.Application.Services;
using eMuhasebeServer.Domain.Entities;
using eMuhasebeServer.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TS.Result;
using System.Linq;

namespace eMuhasebeServer.Application.Features.SalaryPayments.GetSalaryPaymentsByEmployeeId;

internal sealed class GetSalaryPaymentsByEmployeeIdQueryHandler(
    ISalaryPaymentRepository salaryPaymentRepository) : IRequestHandler<GetSalaryPaymentsByEmployeeIdQuery, Result<List<SalaryPayment>>>
{
    public async Task<Result<List<SalaryPayment>>> Handle(GetSalaryPaymentsByEmployeeIdQuery request, CancellationToken cancellationToken)
    {
        var salaryPayments = await salaryPaymentRepository
            .Where(p => p.EmployeeId == Guid.Parse(request.EmployeeId))
            .OrderByDescending(p => p.PaymentDate)
            .ToListAsync(cancellationToken);

        return salaryPayments;
    }
}