using eMuhasebeServer.Application.Services;
using eMuhasebeServer.Domain.Entities;
using eMuhasebeServer.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Products.GetAllDeletedProducts;

internal sealed class GetAllDeletedProductsQueryHandler(
    IProductRepository productRepository) : IRequestHandler<GetAllDeletedProductsQuery, Result<List<Product>>>
{
    public async Task<Result<List<Product>>> Handle(GetAllDeletedProductsQuery request, CancellationToken cancellationToken)
    {
        // IgnoreQueryFilters() ile query filter'ı bypass ediyoruz (IsDeleted filter'ını devre dışı bırakıyoruz)
        List<Product> products = await productRepository
            .GetAll()
            .IgnoreQueryFilters()
            .Where(p => p.IsDeleted == true)
            .OrderBy(p => p.Name)
            .ToListAsync(cancellationToken);

        return products;
    }
}