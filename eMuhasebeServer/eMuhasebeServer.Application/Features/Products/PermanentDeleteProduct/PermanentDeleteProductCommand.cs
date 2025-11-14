using MediatR;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Products.PermanentDeleteProduct;

public sealed record PermanentDeleteProductCommand(Guid Id) : IRequest<Result<string>>;