using MediatR;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Reports.CustomerCount;

public sealed record CustomerCountQuery : IRequest<Result<int>>;