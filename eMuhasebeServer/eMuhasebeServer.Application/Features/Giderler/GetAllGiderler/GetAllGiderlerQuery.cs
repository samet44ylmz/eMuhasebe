using eMuhasebeServer.Application.Services;
using eMuhasebeServer.Domain.Entities;
using MediatR;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Giderler.GetAllGiderler;

public sealed record GetAllGiderlerQuery(
    DateOnly StartDate,
    DateOnly EndDate,
    int? CategoryId = null) : IRequest<Result<List<Gider>>>;