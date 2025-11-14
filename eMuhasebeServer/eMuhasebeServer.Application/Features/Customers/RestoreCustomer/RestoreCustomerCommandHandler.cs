using eMuhasebeServer.Application.Services;
using eMuhasebeServer.Domain.Entities;
using eMuhasebeServer.Domain.Repositories;
using GenericRepository;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Customers.RestoreCustomer;

internal sealed class RestoreCustomerCommandHandler(
    ICustomerRepository customerRepository,
    IUnitOfWork unitOfWork,
    ICacheService cacheService) : IRequestHandler<RestoreCustomerCommand, Result<string>>
{
    public async Task<Result<string>> Handle(RestoreCustomerCommand request, CancellationToken cancellationToken)
    {
        // IgnoreQueryFilters() ile query filter'ı bypass ediyoruz (silinen müşterileri bulabilmek için)
        Customer? customer = await customerRepository
            .GetAll()
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

        if (customer is null)
        {
            return Result<string>.Failure("Cari bulunamadı");
        }

        if (!customer.IsDeleted)
        {
            return Result<string>.Failure("Cari zaten aktif");
        }

        customer.IsDeleted = false;
        customerRepository.Update(customer);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        
        // Clear the customers cache to ensure the restored customer appears in the list
        string cacheKey = cacheService.GetCompanyCacheKey("customers");
        cacheService.Remove(cacheKey);

        return "Cari başarıyla geri yüklendi";
    }
}