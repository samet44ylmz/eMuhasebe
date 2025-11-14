using MediatR;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Products.BulkRestoreProducts;

public sealed record BulkRestoreProductsCommand(List<Guid> Ids) : IRequest<Result<string>>;