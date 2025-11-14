using eMuhasebeServer.Application.Services;
using eMuhasebeServer.Domain.Entities;
using eMuhasebeServer.Domain.Repositories;
using GenericRepository;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Customers.PermanentDeleteCustomer;

internal sealed class PermanentDeleteCustomerCommandHandler(
    ICustomerRepository customerRepository,
    IUnitOfWork unitOfWork,
    ICacheService cacheService) : IRequestHandler<PermanentDeleteCustomerCommand, Result<string>>
{
    public async Task<Result<string>> Handle(PermanentDeleteCustomerCommand request, CancellationToken cancellationToken)
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
            return Result<string>.Failure("Önce müşteriyi silmeniz gerekir");
        }

        customerRepository.Delete(customer);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        
        // Clear the customers cache to ensure the permanently deleted customer is removed from the list
        string cacheKey = cacheService.GetCompanyCacheKey("customers");
        cacheService.Remove(cacheKey);

        return "Cari kalıcı olarak silindi";
    }
}