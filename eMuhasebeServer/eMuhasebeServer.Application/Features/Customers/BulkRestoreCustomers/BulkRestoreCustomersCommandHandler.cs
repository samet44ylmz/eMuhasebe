using eMuhasebeServer.Application.Services;
using eMuhasebeServer.Domain.Entities;
using eMuhasebeServer.Domain.Repositories;
using GenericRepository;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Customers.BulkRestoreCustomers;

internal sealed class BulkRestoreCustomersCommandHandler(
    ICustomerRepository customerRepository,
    IUnitOfWork unitOfWork,
    ICacheService cacheService) : IRequestHandler<BulkRestoreCustomersCommand, Result<string>>
{
    public async Task<Result<string>> Handle(BulkRestoreCustomersCommand request, CancellationToken cancellationToken)
    {
        // IgnoreQueryFilters() ile query filter'ı bypass ediyoruz (silinen müşterileri bulabilmek için)
        List<Customer> customers = await customerRepository
            .GetAll()
            .IgnoreQueryFilters()
            .Where(p => request.Ids.Contains(p.Id) && p.IsDeleted)
            .ToListAsync(cancellationToken);

        if (customers.Count == 0)
        {
            return Result<string>.Failure("Geri yüklenecek cari bulunamadı");
        }

        foreach (var customer in customers)
        {
            customer.IsDeleted = false;
            customerRepository.Update(customer);
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);
        
        // Clear the customers cache to ensure the restored customers appear in the list
        string cacheKey = cacheService.GetCompanyCacheKey("customers");
        cacheService.Remove(cacheKey);

        return $"{customers.Count} cari başarıyla geri yüklendi";
    }
}