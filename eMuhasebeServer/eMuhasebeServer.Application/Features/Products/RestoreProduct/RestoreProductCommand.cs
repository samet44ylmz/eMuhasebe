using MediatR;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Products.RestoreProduct;

public sealed record RestoreProductCommand(Guid Id) : IRequest<Result<string>>;