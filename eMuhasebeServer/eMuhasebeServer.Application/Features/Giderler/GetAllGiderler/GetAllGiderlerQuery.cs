using eMuhasebeServer.Application.Services;
using eMuhasebeServer.Domain.Dtos;
using MediatR;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Giderler.GetAllGiderler;

public sealed record GetAllGiderlerQuery(
    DateOnly StartDate,
    DateOnly EndDate,
    int? CategoryId = null) : IRequest<Result<List<GiderDto>>>;