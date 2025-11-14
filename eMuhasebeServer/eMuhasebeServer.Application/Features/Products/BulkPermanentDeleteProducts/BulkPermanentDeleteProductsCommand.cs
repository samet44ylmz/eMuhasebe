using MediatR;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Products.BulkPermanentDeleteProducts;

public sealed record BulkPermanentDeleteProductsCommand(List<Guid> Ids) : IRequest<Result<string>>;