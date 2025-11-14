using eMuhasebeServer.Application.Services;
using eMuhasebeServer.Domain.Entities;
using eMuhasebeServer.Domain.Repositories;
using GenericRepository;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Products.BulkRestoreProducts;

internal sealed class BulkRestoreProductsCommandHandler(
    IProductRepository productRepository,
    IUnitOfWork unitOfWork) : IRequestHandler<BulkRestoreProductsCommand, Result<string>>
{
    public async Task<Result<string>> Handle(BulkRestoreProductsCommand request, CancellationToken cancellationToken)
    {
        // IgnoreQueryFilters() ile query filter'ı bypass ediyoruz (silinen ürünleri bulabilmek için)
        List<Product> products = await productRepository
            .GetAll()
            .IgnoreQueryFilters()
            .Where(p => request.Ids.Contains(p.Id) && p.IsDeleted)
            .ToListAsync(cancellationToken);

        if (products.Count == 0)
        {
            return Result<string>.Failure("Geri yüklenecek ürün bulunamadı");
        }

        foreach (var product in products)
        {
            product.IsDeleted = false;
            productRepository.Update(product);
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return $"{products.Count} ürün başarıyla geri yüklendi";
    }
}