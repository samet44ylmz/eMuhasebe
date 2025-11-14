using eMuhasebeServer.Domain.Entities;
using eMuhasebeServer.Domain.Repositories;
using eMuhasebeServer.Infrastructure.Context;
using GenericRepository;

namespace eMuhasebeServer.Infrastructure.Repositories;

internal sealed class ProductDetailRepository : Repository<ProductDetail, ApplicationDbContext>, IProductDetailRepository
{
    public ProductDetailRepository(ApplicationDbContext context) : base(context)
    {
    }
}