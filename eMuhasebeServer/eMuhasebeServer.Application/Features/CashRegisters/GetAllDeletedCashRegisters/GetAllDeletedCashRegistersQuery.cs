using eMuhasebeServer.Domain.Entities;
using MediatR;
using TS.Result;

namespace eMuhasebeServer.Application.Features.CashRegisters.GetAllDeletedCashRegisters;

public sealed record GetAllDeletedCashRegistersQuery() : IRequest<Result<List<CashRegister>>>;