using eMuhasebeServer.Application.Services;
using eMuhasebeServer.Domain.Entities;
using eMuhasebeServer.Domain.Repositories;
using GenericRepository;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Invoices.BulkRestoreInvoices;

internal sealed class BulkRestoreInvoicesCommandHandler(
    IInvoiceRepository invoiceRepository,
    ICustomerRepository customerRepository,
    ICustomerDetailRepository customerDetailRepository,
    IProductRepository productRepository,
    IProductDetailRepository productDetailRepository,
    IUnitOfWork unitOfWork,
    ICacheService cacheService) : IRequestHandler<BulkRestoreInvoicesCommand, Result<string>>
{
    public async Task<Result<string>> Handle(BulkRestoreInvoicesCommand request, CancellationToken cancellationToken)
    {
        // IgnoreQueryFilters() ile query filter'ı bypass ediyoruz (silinen faturaları bulabilmek için)
        List<Invoice> invoices = await invoiceRepository
            .GetAll()
            .IgnoreQueryFilters()
            .Where(p => request.Ids.Contains(p.Id) && p.IsDeleted)
            .ToListAsync(cancellationToken);

        if (invoices.Count == 0)
        {
            return Result<string>.Failure("Geri yüklenecek fatura bulunamadı");
        }

        foreach (var invoice in invoices)
        {
            // Restore the customer detail associated with this invoice
            CustomerDetail? customerDetail = await customerDetailRepository
                .GetAll()
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(p => p.InvoiceId == invoice.Id && p.IsDeleted, cancellationToken);

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

            invoice.IsDeleted = false;
            invoiceRepository.Update(invoice);
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);

        cacheService.Remove(cacheService.GetCompanyCacheKey("invoices"));
        cacheService.Remove(cacheService.GetCompanyCacheKey("customers"));
        cacheService.Remove(cacheService.GetCompanyCacheKey("products"));

        return $"{invoices.Count} fatura başarıyla geri yüklendi";
    }
}