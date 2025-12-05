using eMuhasebeServer.Application.Services;
using eMuhasebeServer.Domain.Entities;
using eMuhasebeServer.Domain.Repositories;
using GenericRepository;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Invoices.RestoreInvoice;

internal sealed class RestoreInvoiceCommandHandler(
    IInvoiceRepository invoiceRepository,
    ICustomerRepository customerRepository,
    ICustomerDetailRepository customerDetailRepository,
    IProductRepository productRepository,
    IProductDetailRepository productDetailRepository,
    ICashRegisterRepository cashRegisterRepository,
    ICashRegisterDetailRepository cashRegisterDetailRepository,
    IUnitOfWork unitOfWork,
    ICacheService cacheService) : IRequestHandler<RestoreInvoiceCommand, Result<string>>
{
    public async Task<Result<string>> Handle(RestoreInvoiceCommand request, CancellationToken cancellationToken)
    {
        // IgnoreQueryFilters() ile query filter'ı bypass ediyoruz (silinen faturaları bulabilmek için)
        Invoice? invoice = await invoiceRepository
            .GetAll()
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

        if (invoice is null)
        {
            return Result<string>.Failure("Fatura bulunamadı");
        }

        if (!invoice.IsDeleted)
        {
            return Result<string>.Failure("Fatura zaten aktif");
        }

        // Restore the customer detail associated with this invoice
        CustomerDetail? customerDetail = await customerDetailRepository
            .GetAll()
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(p => p.InvoiceId == request.Id && p.IsDeleted, cancellationToken);

        if (customerDetail is not null)
        {
            customerDetail.IsDeleted = false;
            customerDetailRepository.Update(customerDetail);
        }

        // Restore the customer amounts
        Customer? customer = await customerRepository.GetByExpressionWithTrackingAsync(p => p.Id == invoice.CustomerId, cancellationToken);

        if (customer is not null)
        {
            customer.DepositAmount += invoice.Type.Value == 1 ? 0 : invoice.Amount;
            customer.WithdrawalAmount += invoice.Type.Value == 2 ? 0 : invoice.Amount;

            customerRepository.Update(customer);
        }

        // Restore the product details
        List<ProductDetail> productDetails = await productDetailRepository
            .GetAll()
            .IgnoreQueryFilters()
            .Where(p => p.InvoiceId == invoice.Id && p.IsDeleted)
            .ToListAsync(cancellationToken);

        foreach (var detail in productDetails)
        {
            Product? product = await productRepository.GetByExpressionWithTrackingAsync(p => p.Id == detail.ProductId, cancellationToken);

            if (product is not null)
            {
                product.Deposit += detail.Deposit;
                product.Withdrawal += detail.Withdrawal;

                productRepository.Update(product);
            }
            
            detail.IsDeleted = false;
            productDetailRepository.Update(detail);
        }

        // Restore cash register details associated with invoice payments
        // Updated to match the correct description pattern used in PayInvoiceCommandHandler
        List<CashRegisterDetail> paymentCashDetails = await cashRegisterDetailRepository
            .GetAll()
            .IgnoreQueryFilters()
            .Where(p => p.Description.StartsWith($"{invoice.InvoiceNumber} Numaralı Fatura Ödemesi") && p.IsDeleted)
            .ToListAsync(cancellationToken);

        foreach (var paymentCashDetail in paymentCashDetails)
        {
            // Restore the cash register balance change
            CashRegister? paymentCashRegister = await cashRegisterRepository.GetByExpressionWithTrackingAsync(p => p.Id == paymentCashDetail.CashRegisterId, cancellationToken);

            if (paymentCashRegister is not null)
            {
                paymentCashRegister.DepositAmount += paymentCashDetail.DepositAmount;
                paymentCashRegister.WithdrawalAmount += paymentCashDetail.WithdrawalAmount;
                cashRegisterRepository.Update(paymentCashRegister);
            }

            // Mark the cash register detail as not deleted
            paymentCashDetail.IsDeleted = false;
            cashRegisterDetailRepository.Update(paymentCashDetail);
        }

        // Restore cash register operations for the original invoice
        if (invoice.Type.Value == 1) // Purchase invoice
        {
            // Find and restore the cash register detail created for this invoice
            CashRegisterDetail? cashRegisterDetail = await cashRegisterDetailRepository
                .GetAll()
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(p => p.Description == $"{invoice.InvoiceNumber} Numaralı Fatura" && p.IsDeleted, cancellationToken);

            if (cashRegisterDetail is not null)
            {
                // Restore the cash register balance change
                CashRegister? cashRegister = await cashRegisterRepository.GetByExpressionWithTrackingAsync(p => p.Id == cashRegisterDetail.CashRegisterId, cancellationToken);

                if (cashRegister is not null)
                {
                    cashRegister.DepositAmount += invoice.Amount;
                    cashRegisterRepository.Update(cashRegister);
                }

                // Mark the cash register detail as not deleted
                cashRegisterDetail.IsDeleted = false;
                cashRegisterDetailRepository.Update(cashRegisterDetail);
            }
        }

        invoice.IsDeleted = false;
        invoiceRepository.Update(invoice);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        cacheService.Remove(cacheService.GetCompanyCacheKey("invoices"));
        cacheService.Remove(cacheService.GetCompanyCacheKey("customers"));
        cacheService.Remove(cacheService.GetCompanyCacheKey("products"));
        cacheService.Remove(cacheService.GetCompanyCacheKey("cashRegisters"));

        return "Fatura kaydı başarıyla geri yüklendi";
    }
}