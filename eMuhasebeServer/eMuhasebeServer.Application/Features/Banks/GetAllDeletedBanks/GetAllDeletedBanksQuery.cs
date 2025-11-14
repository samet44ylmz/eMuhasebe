using eMuhasebeServer.Domain.Entities;
using MediatR;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Banks.GetAllDeletedBanks;

public sealed record GetAllDeletedBanksQuery() : IRequest<Result<List<Bank>>>;