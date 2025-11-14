using eMuhasebeServer.Domain.Entities;
using MediatR;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Giderler.GetAllDeletedGiderler;

public sealed record GetAllDeletedGiderlerQuery() : IRequest<Result<List<Gider>>>;