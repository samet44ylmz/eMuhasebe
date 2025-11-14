﻿using eMuhasebeServer.Application.Services;
using eMuhasebeServer.Domain.Entities;
using eMuhasebeServer.Domain.Enums;
using eMuhasebeServer.Domain.Repositories;
using GenericRepository;
using MediatR;
using TS.Result;

namespace eMuhasebeServer.Application.Features.CashRegisterDetails.CreateCashRegisterDetail;

internal sealed class CreateCashRegisterDetailCommandHandler(
    ICustomerRepository customerRepository,
    ICustomerDetailRepository customerDetailRepository,
    IBankRepository bankRepository,
    IBankDetailRepository bankDetailRepository,
    ICashRegisterRepository cashRegisterRepository,
    ICashRegisterDetailRepository cashRegisterDetailRepository,
    IGiderRepository giderRepository,
    IUnitOfWork unitOfWork,
    ICacheService cacheService) : IRequestHandler<CreateCashRegisterDetailCommand,
    Result<string>>
{
    public async Task<Result<string>> Handle(CreateCashRegisterDetailCommand request, CancellationToken cancellationToken)
    {

        CashRegister cashRegister = await cashRegisterRepository.GetByExpressionWithTrackingAsync(p => p.Id ==
        request.CashRegisterId, cancellationToken);

        cashRegister.DepositAmount += (request.Type == 0 ? request.Amount : 0);
        cashRegister.WithdrawalAmount += (request.Type == 1 ? request.Amount : 0);

        CashRegisterDetail cashRegisterDetail = new()
        {
            Date = request.Date,
            DepositAmount = request.Type == 0 ? request.Amount : 0,
            WithdrawalAmount = request.Type == 1 ? request.Amount : 0,
            Description = request.Description,
            CashRegisterId = request.CashRegisterId,
        };

        await cashRegisterDetailRepository.AddAsync(cashRegisterDetail, cancellationToken);
       
        // Create Gider (Expense) for withdrawal when no opposite party is specified
        if (request.Type == 1 && request.OppositeCashRegisterId is null && 
            request.OppositeBankId is null && request.OppositeCustomerId is null)
        {
            Gider gider = new()
            {
                Name = "Kasa Çıkışı",
                Date = request.Date,
                Description = request.Description,
                Price = request.Amount,
                CategoryType = GiderCategoryTypeEnum.Diğer,
                CashRegisterDetailId = cashRegisterDetail.Id
            };
            
            cashRegisterDetail.GiderId = gider.Id;
            await giderRepository.AddAsync(gider, cancellationToken);
        }

        if (request.OppositeCashRegisterId is not null)
        {


            CashRegister oppositeCashRegister = await cashRegisterRepository.GetByExpressionWithTrackingAsync(p => p.Id ==
            request.OppositeCashRegisterId, cancellationToken);

            oppositeCashRegister.DepositAmount += (request.Type == 1 ? request.OppositeAmount : 0);
            oppositeCashRegister.WithdrawalAmount += (request.Type == 0 ? request.OppositeAmount : 0);

            CashRegisterDetail oppositeCashRegisterDetail = new()
            {
                Date = request.Date,
                DepositAmount = request.Type == 1 ? request.OppositeAmount : 0,
                WithdrawalAmount = request.Type == 0 ? request.OppositeAmount : 0,

                CashRegisterDetailId = cashRegisterDetail.Id,
                Description = request.Description,
                CashRegisterId = (Guid)request.OppositeCashRegisterId,
            };

            cashRegisterDetail.CashRegisterDetailId = oppositeCashRegisterDetail.Id;
            await cashRegisterDetailRepository.AddAsync(oppositeCashRegisterDetail, cancellationToken);
           
        }

        if (request.OppositeBankId is not null)
        {


            Bank oppositeBank = await bankRepository.GetByExpressionWithTrackingAsync(p => p.Id ==
            request.OppositeBankId, cancellationToken);

            oppositeBank.DepositAmount += (request.Type == 1 ? request.OppositeAmount : 0);
            oppositeBank.WithdrawalAmount += (request.Type == 0 ? request.OppositeAmount : 0);

            BankDetail oppositeBankDetail = new()
            {
                Date = request.Date,
                DepositAmount = request.Type == 1 ? request.OppositeAmount : 0,
                WithdrawalAmount = request.Type == 0 ? request.OppositeAmount : 0,

                CashRegisterDetailId = cashRegisterDetail.Id,
                Description = request.Description,
                BankId = (Guid)request.OppositeBankId,
            };

            cashRegisterDetail.BankDetailId = oppositeBankDetail.Id;
            await bankDetailRepository.AddAsync(oppositeBankDetail, cancellationToken);

        }

        if (request.OppositeCustomerId is not null)
        {
            Customer? customer = await customerRepository.GetByExpressionWithTrackingAsync(p => p.Id == request.OppositeCustomerId, cancellationToken);

            if (customer is null)
            {
                return Result<string>.Failure("Cari bulunamadı");
            }

            customer.DepositAmount += request.Type == 1 ? request.Amount : 0;
            customer.WithdrawalAmount += request.Type == 0 ? request.Amount : 0;

            CustomerDetail customerDetail = new()
            {
                CustomerId = customer.Id,
                CashRegisterId = cashRegisterDetail.Id,
                Date = request.Date,
                Description = request.Description,
                DepositAmount = request.Type == 1 ? request.Amount : 0,
                WithdrawalAmount = request.Type == 0 ? request.Amount : 0,
                Type = CustomerDetailTypeEnum.CashRegister
            };
            cashRegisterDetail.CustomerDetailId = customerDetail.Id;

            await customerDetailRepository.AddAsync(customerDetail, cancellationToken);
            cacheService.Remove(cacheService.GetCompanyCacheKey("customers"));
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);

        cacheService.Remove(cacheService.GetCompanyCacheKey("banks"));
        cacheService.Remove(cacheService.GetCompanyCacheKey("cashRegisters"));
        cacheService.Remove(cacheService.GetCompanyCacheKey("giderler"));
      
        return "Kasa hareketi başarıyla işlendi";
    }
}


