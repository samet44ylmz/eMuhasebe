using eMuhasebeServer.Application.Services;
using eMuhasebeServer.Domain.Entities;
using eMuhasebeServer.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TS.Result;

namespace eMuhasebeServer.Application.Features.SalaryPayments.GetAllSalaryPayments;

internal sealed class GetAllSalaryPaymentsQueryHandler(
    ISalaryPaymentRepository salaryPaymentRepository,
    ICacheService cacheService) : IRequestHandler<GetAllSalaryPaymentsQuery, Result<List<SalaryPayment>>>
{
    public async Task<Result<List<SalaryPayment>>> Handle(GetAllSalaryPaymentsQuery request, CancellationToken cancellationToken)
    {
        List<SalaryPayment>? salaryPayments;

        string cacheKey = cacheService.GetCompanyCacheKey("salaryPayments");
        salaryPayments = cacheService.Get<List<SalaryPayment>>(cacheKey);

        if (salaryPayments is null)
        {
            salaryPayments = await salaryPaymentRepository.GetAll().OrderByDescending(p => p.PaymentDate).ToListAsync(cancellationToken);

            cacheService.Set(cacheKey, "salaryPayments");
        }
        return salaryPayments;
    }
}
