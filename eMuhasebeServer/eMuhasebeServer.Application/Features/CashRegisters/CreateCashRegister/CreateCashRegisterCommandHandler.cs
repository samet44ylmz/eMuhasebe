﻿using AutoMapper;
using eMuhasebeServer.Application.Services;
using eMuhasebeServer.Domain.Entities;
using eMuhasebeServer.Domain.Repositories;
using GenericRepository;
using MediatR;
using TS.Result;

namespace eMuhasebeServer.Application.Features.CashRegisters.CreateCashRegister;

internal sealed class CreateCashRegisterCommandHandler(
    ICashRegisterRepository cashRegisterRepository,
    IUnitOfWork unitOfWork,
    IMapper mapper,
    ICacheService cacheService) : IRequestHandler<CreateCashRegisterCommand, Result<string>>
{
    public async Task<Result<string>> Handle(CreateCashRegisterCommand request, CancellationToken cancellationToken)
    {
        bool isNameExists = await cashRegisterRepository.AnyAsync(p => p.Name == request.Name, cancellationToken);

        if (isNameExists)
        {
            return Result<string>.Failure("Bu kasa adı daha önce kullanılmış");
        }

        CashRegister cashRegister = mapper.Map<CashRegister>(request);

        await cashRegisterRepository.AddAsync(cashRegister);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        cacheService.Remove(cacheService.GetCompanyCacheKey("cashRegisters"));

        return "Kasa kaydı başarıyla tamamlandı";

    }
}
