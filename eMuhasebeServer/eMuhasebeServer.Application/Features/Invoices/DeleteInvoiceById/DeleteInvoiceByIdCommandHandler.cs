using eMuhasebeServer.Application.Services;
using eMuhasebeServer.Domain.Entities;
using eMuhasebeServer.Domain.Enums;
using eMuhasebeServer.Domain.Repositories;
using GenericRepository;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Invoices.DeleteInvoiceById;

internal sealed class DeleteInvoiceByIdCommandHandler(
    IInvoiceRepository invoiceRepository,
    ICustomerRepository customerRepository,
    ICustomerDetailRepository customerDetailRepository,
    IProductRepository productRepository,
    IProductDetailRepository productDetailRepository,
    ICashRegisterRepository cashRegisterRepository,
    ICashRegisterDetailRepository cashRegisterDetailRepository,
    IUnitOfWork unitOfWork,
    ICacheService cacheService) : IRequestHandler<DeleteInvoiceByIdCommand, Result<string>>
{
    public async Task<Result<string>> Handle(DeleteInvoiceByIdCommand request, CancellationToken cancellationToken)
    {
        Invoice? invoice = await invoiceRepository.GetAll().Include(p => p.Details).FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

        if (invoice is null)
        {
            return Result<string>.Failure("Fatura bulunamadı");
        }

        // Get IDs of all payments made for this invoice first, then process them
        var invoicePaymentIds = await customerDetailRepository
            .GetAll()
            .Where(p => p.InvoiceId == request.Id && p.Type == CustomerDetailTypeEnum.InvoicePayment)
            .Select(p => p.Id)
            .ToListAsync(cancellationToken);

        foreach (var paymentId in invoicePaymentIds)
        {
            // Get a fresh instance for each operation to avoid tracking conflicts
            CustomerDetail? payment = await customerDetailRepository
                .GetByExpressionWithTrackingAsync(p => p.Id == paymentId, cancellationToken);

            if (payment is not null)
            {
                // Reverse the payment by adjusting customer balances
                Customer? paymentCustomer = await customerRepository
                    .GetByExpressionWithTrackingAsync(p => p.Id == payment.CustomerId, cancellationToken);

                if (paymentCustomer is not null)
                {
                    // Reverse the payment amounts
                    paymentCustomer.DepositAmount -= payment.DepositAmount;
                    paymentCustomer.WithdrawalAmount -= payment.WithdrawalAmount;
                    
                    customerRepository.Update(paymentCustomer);
                }

                // Mark the payment as deleted
                payment.IsDeleted = true;
                customerDetailRepository.Update(payment);
            }
        }

        // Get IDs of cash register details associated with invoice payments first, then process them
        var paymentCashDetailIds = await cashRegisterDetailRepository
            .GetAll()
            .Where(p => p.Description.Contains($"{invoice.InvoiceNumber} Numaralı Fatura Ödemesi"))
            .Select(p => p.Id)
            .ToListAsync(cancellationToken);

        foreach (var cashDetailId in paymentCashDetailIds)
        {
            // Get a fresh instance for each operation to avoid tracking conflicts
            CashRegisterDetail? paymentCashDetail = await cashRegisterDetailRepository
                .GetByExpressionWithTrackingAsync(p => p.Id == cashDetailId, cancellationToken);

            if (paymentCashDetail is not null)
            {
                // Reverse the cash register balance change
                CashRegister? paymentCashRegister = await cashRegisterRepository
                    .GetByExpressionWithTrackingAsync(p => p.Id == paymentCashDetail.CashRegisterId, cancellationToken);

                if (paymentCashRegister is not null)
                {
                    paymentCashRegister.DepositAmount -= paymentCashDetail.DepositAmount;
                    paymentCashRegister.WithdrawalAmount -= paymentCashDetail.WithdrawalAmount;
                    cashRegisterRepository.Update(paymentCashRegister);
                }

                // Mark the cash register detail as deleted
                paymentCashDetail.IsDeleted = true;
                cashRegisterDetailRepository.Update(paymentCashDetail);
            }
        }

        CustomerDetail? customerDetail = await customerDetailRepository
            .GetByExpressionWithTrackingAsync(p => p.InvoiceId == request.Id, cancellationToken);

        if (customerDetail is not null)
        {
            customerDetail.IsDeleted = true;
            customerDetailRepository.Update(customerDetail);
        }

        Customer? customer = await customerRepository
            .GetByExpressionWithTrackingAsync(p => p.Id == invoice.CustomerId, cancellationToken);

        if (customer is not null)
        {
            customer.DepositAmount -= invoice.Type.Value == 1 ? 0 : invoice.Amount;
            customer.WithdrawalAmount -= invoice.Type.Value == 2 ? 0 : invoice.Amount;

            customerRepository.Update(customer);
        }

        List<ProductDetail> productDetails = await productDetailRepository
            .GetAll()
            .Where(p => p.InvoiceId == invoice.Id)
            .ToListAsync(cancellationToken);

        foreach (var detail in productDetails)
        {
            Product? product = await productRepository
                .GetByExpressionWithTrackingAsync(p => p.Id == detail.ProductId, cancellationToken);

            if (product is not null)
            {
                product.Deposit -= detail.Deposit;
                product.Withdrawal -= detail.Withdrawal;

                productRepository.Update(product);
            }
            
            detail.IsDeleted = true;
            productDetailRepository.Update(detail);
        }

        // Reverse cash register operations for the original invoice
        if (invoice.Type.Value == 1) // Purchase invoice
        {
            // Find and delete the cash register detail created for this invoice
            CashRegisterDetail? cashRegisterDetail = await cashRegisterDetailRepository
                .GetByExpressionWithTrackingAsync(p => p.Description == $"{invoice.InvoiceNumber} Numaralı Fatura", cancellationToken);

            if (cashRegisterDetail is not null)
            {
                // Reverse the cash register balance change
                CashRegister? cashRegister = await cashRegisterRepository
                    .GetByExpressionWithTrackingAsync(p => p.Id == cashRegisterDetail.CashRegisterId, cancellationToken);

                if (cashRegister is not null)
                {
                    cashRegister.DepositAmount -= invoice.Amount;
                    cashRegisterRepository.Update(cashRegister);
                }

                // Mark the cash register detail as deleted
                cashRegisterDetail.IsDeleted = true;
                cashRegisterDetailRepository.Update(cashRegisterDetail);
            }
        }

        invoice.IsDeleted = true;
        invoiceRepository.Update(invoice);

        await unitOfWork.SaveChangesAsync(cancellationToken);

        cacheService.Remove(cacheService.GetCompanyCacheKey("invoices"));
        cacheService.Remove(cacheService.GetCompanyCacheKey("customers"));
        cacheService.Remove(cacheService.GetCompanyCacheKey("products"));
        cacheService.Remove(cacheService.GetCompanyCacheKey("cashRegisters"));

        return "Fatura kaydı başarıyla silindi";
    }
}