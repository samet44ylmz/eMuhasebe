using eMuhasebeServer.Application.Services;
using eMuhasebeServer.Domain.Entities;
using MediatR;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Giderler.GetAllGiderler;

public sealed record GetAllGiderlerQuery() : IRequest<Result<List<Gider>>>;

    

