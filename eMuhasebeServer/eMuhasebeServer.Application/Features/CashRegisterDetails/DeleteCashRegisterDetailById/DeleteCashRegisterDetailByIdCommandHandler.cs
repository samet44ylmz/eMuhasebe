﻿using eMuhasebeServer.Application.Services;
using eMuhasebeServer.Domain.Entities;
using eMuhasebeServer.Domain.Repositories;
using GenericRepository;
using MediatR;
using TS.Result;

namespace eMuhasebeServer.Application.Features.CashRegisterDetails.DeleteCashRegisterById;

internal sealed class DeleteCashRegisterDetailByIdCommandHandler(
    ICustomerRepository customerRepository,
    ICustomerDetailRepository customerDetailRepository,
    IBankRepository bankRepository,
    IBankDetailRepository bankDetailRepository,
    ICashRegisterRepository cashRegisterRepository,
    ICashRegisterDetailRepository cashRegisterDetailRepository,
    IGiderRepository giderRepository,
    IUnitOfWork unitOfWork,
    ICacheService cacheService) :
    IRequestHandler<DeleteCashRegisterDetailByIdCommand, Result<string>>
{
    public async Task<Result<string>> Handle(DeleteCashRegisterDetailByIdCommand request, CancellationToken cancellationToken)
    {
        CashRegisterDetail? cashRegisterDetail = await cashRegisterDetailRepository.GetByExpressionWithTrackingAsync(p => p.Id == request.Id, cancellationToken);

        if (cashRegisterDetail is null)
        {
            return Result<string>.Failure("Kasa hareketi bulunamadı");
        }

        CashRegister? cashRegister = await cashRegisterRepository.GetByExpressionWithTrackingAsync(p => p.Id == cashRegisterDetail.CashRegisterId, cancellationToken);
        if (cashRegister == null)
        {
            return Result<string>.Failure("Kasa bulunamadı");
        }

        cashRegister.DepositAmount -= cashRegisterDetail.DepositAmount;
        cashRegister.WithdrawalAmount -= cashRegisterDetail.WithdrawalAmount;

        if (cashRegisterDetail.CashRegisterDetailId is not null)
        {
            CashRegisterDetail? oppositeCashRegisterDetail = await cashRegisterDetailRepository.GetByExpressionWithTrackingAsync(p => p.Id == cashRegisterDetail.CashRegisterDetailId, cancellationToken);

            if (oppositeCashRegisterDetail is null)
            {
                return Result<string>.Failure("Kasa hareketi bulunamadı");
            }

            CashRegister? oppositeCashRegister = await cashRegisterRepository.GetByExpressionWithTrackingAsync(p => p.Id == oppositeCashRegisterDetail.CashRegisterId, cancellationToken);
            if (oppositeCashRegister == null)
            {
                return Result<string>.Failure("Kasa bulunamadı");
            }

            oppositeCashRegister.DepositAmount -= oppositeCashRegisterDetail.DepositAmount;
            oppositeCashRegister.WithdrawalAmount -= oppositeCashRegisterDetail.WithdrawalAmount;

            cashRegisterDetailRepository.Delete(oppositeCashRegisterDetail);
        }

        if (cashRegisterDetail.BankDetailId is not null)
        {
            BankDetail? oppositeBankDetail = await bankDetailRepository.GetByExpressionWithTrackingAsync(p => p.Id == cashRegisterDetail.BankDetailId, cancellationToken);

            if (oppositeBankDetail is null)
            {
                return Result<string>.Failure("Banka hareketi bulunamadı");
            }

            Bank? oppositeBank = await bankRepository.GetByExpressionWithTrackingAsync(p => p.Id == oppositeBankDetail.BankId, cancellationToken);
            if (oppositeBank == null)
            {
                return Result<string>.Failure("Banka bulunamadı");
            }

            oppositeBank.DepositAmount -= oppositeBankDetail.DepositAmount;
            oppositeBank.WithdrawalAmount -= oppositeBankDetail.WithdrawalAmount;

            bankDetailRepository.Delete(oppositeBankDetail);
        }

        if (cashRegisterDetail.CustomerDetailId is not null)
        {

            CustomerDetail? customerDetail = await customerDetailRepository.GetByExpressionWithTrackingAsync(p => p.Id == cashRegisterDetail.CustomerDetailId, cancellationToken);

            if (customerDetail is null)
            {
                return Result<string>.Failure("Cari hareket bulunamadı");
            }

            Customer? customer = await customerRepository.GetByExpressionWithTrackingAsync(p => p.Id == customerDetail.CustomerId, cancellationToken);
            if (customer == null)
            {
                return Result<string>.Failure("Cari bulunamadı");

            }

            customer.DepositAmount -= customerDetail.DepositAmount;
            customer.WithdrawalAmount -= customerDetail.WithdrawalAmount;

            customerDetailRepository.Delete(customerDetail);
            cacheService.Remove(cacheService.GetCompanyCacheKey("customers"));

        }

        if (cashRegisterDetail.GiderId is not null)
        {
            Gider? gider = await giderRepository.GetByExpressionWithTrackingAsync(p => p.Id == cashRegisterDetail.GiderId, cancellationToken);
            if (gider is null)
            {
                return Result<string>.Failure("Gider bulunamadı");
            }
            giderRepository.Delete(gider);
            cacheService.Remove(cacheService.GetCompanyCacheKey("giderler"));
        }

        cashRegisterDetailRepository.Delete(cashRegisterDetail);

        await unitOfWork.SaveChangesAsync(cancellationToken);

        cacheService.Remove(cacheService.GetCompanyCacheKey("cashRegisters"));
        cacheService.Remove(cacheService.GetCompanyCacheKey("banks"));

        return "Kasa hareketi başarıyla silindi";
    }
}