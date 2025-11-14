using eMuhasebeServer.Domain.Entities;
using MediatR;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Products.GetAllDeletedProducts;

public sealed record GetAllDeletedProductsQuery() : IRequest<Result<List<Product>>>;