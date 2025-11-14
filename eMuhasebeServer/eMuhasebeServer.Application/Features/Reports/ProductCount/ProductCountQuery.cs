using MediatR;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Reports.ProductCount;

public sealed record ProductCountQuery : IRequest<Result<int>>;