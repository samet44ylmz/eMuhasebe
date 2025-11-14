﻿using eMuhasebeServer.Application.Services;
using eMuhasebeServer.Domain.Entities;
using eMuhasebeServer.Domain.Repositories;
using GenericRepository;
using MediatR;
using TS.Result;

namespace eMuhasebeServer.Application.Features.CashRegisters.DeleteCashRegisterById;

internal sealed class DeleteCashRegisterByIdCommandHandler(
    ICashRegisterRepository cashRegisterRepository,
    IUnitOfWork unitOfWork,
    ICacheService cacheService) : IRequestHandler<DeleteCashRegisterByIdCommand,
    Result<string>>
{
    public async Task<Result<string>> Handle(DeleteCashRegisterByIdCommand request, CancellationToken cancellationToken)
    {

        CashRegister? cashRegister = await cashRegisterRepository.GetByExpressionWithTrackingAsync(p => p.Id ==
        request.Id, cancellationToken);

        if (cashRegister is null)
        {
            return Result<string>.Failure("Kasa kaydı bulunamadı");
        }

        cashRegister.IsDeleted = true;
        cashRegisterRepository.Update(cashRegister); // Add this line to properly update the entity

        await unitOfWork.SaveChangesAsync(cancellationToken);

        cacheService.Remove(cacheService.GetCompanyCacheKey("cashRegisters"));

        return "Kasa kaydı başarıyla silindi";

    }
}