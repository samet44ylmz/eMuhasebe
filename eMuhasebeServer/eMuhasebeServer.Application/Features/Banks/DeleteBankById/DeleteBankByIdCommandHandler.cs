﻿using eMuhasebeServer.Application.Services;
using eMuhasebeServer.Domain.Entities;
using eMuhasebeServer.Domain.Repositories;
using GenericRepository;
using MediatR;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Banks.DeleteBankById;

internal sealed class DeleteBankByIdCommandHandler(
    IBankRepository bankRepository,
    IUnitOfWork unitOfWork,
    ICacheService cacheService) : IRequestHandler<DeleteBankByIdCommand, Result<string>>
{
    public async Task<Result<string>> Handle(DeleteBankByIdCommand request, CancellationToken cancellationToken)
    {
        Bank? bank = await bankRepository.GetByExpressionWithTrackingAsync(p => p.Id == request.Id, cancellationToken);

        if (bank is null)
        {
            return Result<string>.Failure("Banka bulunamadı");
        }

        bank.IsDeleted = true;
        bankRepository.Update(bank); // Add this line to properly update the entity

        await unitOfWork.SaveChangesAsync(cancellationToken);

        cacheService.Remove(cacheService.GetCompanyCacheKey("banks"));

        return "Banka başarıyla silindi";
    }
}