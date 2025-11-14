using eMuhasebeServer.Application.Services;
using eMuhasebeServer.Domain.Entities;
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
        Invoice? invoice = await invoiceRepository.Where(p => p.Id == request.Id).Include(p => p.Details).FirstOrDefaultAsync(cancellationToken);

        if (invoice is null)
        {
            return Result<string>.Failure("Fatura bulunamadı");
        }

        CustomerDetail? customerDetail = await customerDetailRepository.Where(p => p.InvoiceId == request.Id).FirstOrDefaultAsync(cancellationToken);

        if (customerDetail is not null)
        {
            customerDetail.IsDeleted = true;
            customerDetailRepository.Update(customerDetail);
        }

        Customer? customer = await customerRepository.Where(p => p.Id == invoice.CustomerId).FirstOrDefaultAsync(cancellationToken);

        if (customer is not null)
        {
            customer.DepositAmount -= invoice.Type.Value == 1 ? 0 : invoice.Amount;
            customer.WithdrawalAmount -= invoice.Type.Value == 2 ? 0 : invoice.Amount;

            customerRepository.Update(customer);
        }

        List<ProductDetail> productDetails = await productDetailRepository.Where(p => p.InvoiceId ==
        invoice.Id).ToListAsync(cancellationToken);

        foreach (var detail in productDetails)
        {
            Product? product = await productRepository.GetByExpressionWithTrackingAsync(p => p.Id == detail.ProductId, cancellationToken);

            if (product is not null)
            {
                product.Deposit -= detail.Deposit;
                product.Withdrawal -= detail.Withdrawal;

                productRepository.Update(product);
            }
            
            detail.IsDeleted = true;
            productDetailRepository.Update(detail);
        }

        // Reverse cash register operations
        if (invoice.Type.Value == 1) // Purchase invoice
        {
            // Find and delete the cash register detail created for this invoice
            CashRegisterDetail? cashRegisterDetail = await cashRegisterDetailRepository
                .Where(p => p.Description == $"{invoice.InvoiceNumber} Numaralı Fatura")
                .FirstOrDefaultAsync(cancellationToken);

            if (cashRegisterDetail is not null)
            {
                // Reverse the cash register balance change
                CashRegister? cashRegister = await cashRegisterRepository
                    .GetByExpressionAsync(p => p.Id == cashRegisterDetail.CashRegisterId, cancellationToken);

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

        return invoice.Type.Name + " kaydı başarıyla silindi";
    }
}