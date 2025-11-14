using eMuhasebeServer.Application.Services;
using eMuhasebeServer.Domain.Entities;
using eMuhasebeServer.Domain.Repositories;
using GenericRepository;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Customers.BulkPermanentDeleteCustomers;

internal sealed class BulkPermanentDeleteCustomersCommandHandler(
    ICustomerRepository customerRepository,
    IUnitOfWork unitOfWork,
    ICacheService cacheService) : IRequestHandler<BulkPermanentDeleteCustomersCommand, Result<string>>
{
    public async Task<Result<string>> Handle(BulkPermanentDeleteCustomersCommand request, CancellationToken cancellationToken)
    {
        // IgnoreQueryFilters() ile query filter'ı bypass ediyoruz (silinen müşterileri bulabilmek için)
        List<Customer> customers = await customerRepository
            .GetAll()
            .IgnoreQueryFilters()
            .Where(p => request.Ids.Contains(p.Id) && p.IsDeleted)
            .ToListAsync(cancellationToken);

        if (customers.Count == 0)
        {
            return Result<string>.Failure("Silinecek cari bulunamadı");
        }

        customerRepository.DeleteRange(customers);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        
        // Clear the customers cache to ensure the deleted customers are removed from the list
        string cacheKey = cacheService.GetCompanyCacheKey("customers");
        cacheService.Remove(cacheKey);

        return $"{customers.Count} cari kalıcı olarak silindi";
    }
}