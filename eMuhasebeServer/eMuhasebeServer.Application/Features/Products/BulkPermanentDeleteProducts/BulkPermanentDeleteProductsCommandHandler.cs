using eMuhasebeServer.Application.Services;
using eMuhasebeServer.Domain.Entities;
using eMuhasebeServer.Domain.Repositories;
using GenericRepository;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Products.BulkPermanentDeleteProducts;

internal sealed class BulkPermanentDeleteProductsCommandHandler(
    IProductRepository productRepository,
    IUnitOfWork unitOfWork,
    ICacheService cacheService) : IRequestHandler<BulkPermanentDeleteProductsCommand, Result<string>>
{
    public async Task<Result<string>> Handle(BulkPermanentDeleteProductsCommand request, CancellationToken cancellationToken)
    {
        // IgnoreQueryFilters() ile query filter'ı bypass ediyoruz (silinen ürünleri bulabilmek için)
        List<Product> products = await productRepository
            .GetAll()
            .IgnoreQueryFilters()
            .Where(p => request.Ids.Contains(p.Id) && p.IsDeleted)
            .ToListAsync(cancellationToken);

        if (products.Count == 0)
        {
            return Result<string>.Failure("Silinecek ürün bulunamadı");
        }

        productRepository.DeleteRange(products);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        
        // Clear the products cache to ensure the permanently deleted products are removed from the list
        string cacheKey = cacheService.GetCompanyCacheKey("products");
        cacheService.Remove(cacheKey);

        return $"{products.Count} ürün kalıcı olarak silindi";
    }
}