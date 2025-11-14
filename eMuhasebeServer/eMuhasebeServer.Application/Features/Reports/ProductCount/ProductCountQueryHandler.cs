using eMuhasebeServer.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Reports.ProductCount;

internal sealed class ProductCountQueryHandler(
    IProductRepository productRepository) : IRequestHandler<ProductCountQuery, Result<int>>
{
    public async Task<Result<int>> Handle(ProductCountQuery request, CancellationToken cancellationToken)
    {
        int count = await productRepository
            .GetAll()
            .Where(p => !p.IsDeleted)
            .CountAsync(cancellationToken);

        return count;
    }
}