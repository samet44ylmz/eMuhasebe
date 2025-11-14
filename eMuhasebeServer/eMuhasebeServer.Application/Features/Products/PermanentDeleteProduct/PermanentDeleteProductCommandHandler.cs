using eMuhasebeServer.Application.Services;
using eMuhasebeServer.Domain.Entities;
using eMuhasebeServer.Domain.Repositories;
using GenericRepository;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Products.PermanentDeleteProduct;

internal sealed class PermanentDeleteProductCommandHandler(
    IProductRepository productRepository,
    IUnitOfWork unitOfWork,
    ICacheService cacheService) : IRequestHandler<PermanentDeleteProductCommand, Result<string>>
{
    public async Task<Result<string>> Handle(PermanentDeleteProductCommand request, CancellationToken cancellationToken)
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
            return Result<string>.Failure("Önce ürün kaydını silmeniz gerekir");
        }

        productRepository.Delete(product);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        
        // Clear the products cache to ensure the permanently deleted product is removed from the list
        string cacheKey = cacheService.GetCompanyCacheKey("products");
        cacheService.Remove(cacheKey);

        return "Ürün kaydı kalıcı olarak silindi";
    }
}