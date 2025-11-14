using eMuhasebeServer.Application.Services;
using eMuhasebeServer.Domain.Entities;
using eMuhasebeServer.Domain.Repositories;
using GenericRepository;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Products.RestoreProduct;

internal sealed class RestoreProductCommandHandler(
    IProductRepository productRepository,
    IUnitOfWork unitOfWork,
    ICacheService cacheService) : IRequestHandler<RestoreProductCommand, Result<string>>
{
    public async Task<Result<string>> Handle(RestoreProductCommand request, CancellationToken cancellationToken)
    {
        // IgnoreQueryFilters() ile query filter'ı bypass ediyoruz (silinen ürünleri bulabilmek için)
        Product? product = await productRepository
            .GetAll()
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

        if (product is null)
        {
            return Result<string>.Failure("Ürün bulunamadı");
        }

        if (!product.IsDeleted)
        {
            return Result<string>.Failure("Ürün zaten aktif");
        }

        product.IsDeleted = false;
        productRepository.Update(product);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        
        // Clear the products cache to ensure the restored product appears in the list
        string cacheKey = cacheService.GetCompanyCacheKey("products");
        cacheService.Remove(cacheKey);

        return "Ürün kaydı başarıyla geri yüklendi";
    }
}