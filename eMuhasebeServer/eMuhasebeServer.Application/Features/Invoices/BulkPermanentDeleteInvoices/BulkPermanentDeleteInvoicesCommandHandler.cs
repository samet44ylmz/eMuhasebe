using eMuhasebeServer.Application.Services;
using eMuhasebeServer.Domain.Entities;
using eMuhasebeServer.Domain.Enums;
using eMuhasebeServer.Domain.Repositories;
using GenericRepository;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Invoices.BulkPermanentDeleteInvoices;

internal sealed class BulkPermanentDeleteInvoicesCommandHandler(
    IInvoiceRepository invoiceRepository,
    ICustomerDetailRepository customerDetailRepository,
    IProductDetailRepository productDetailRepository,
    ICashRegisterDetailRepository cashRegisterDetailRepository,
    IUnitOfWork unitOfWork,
    ICacheService cacheService) : IRequestHandler<BulkPermanentDeleteInvoicesCommand, Result<string>>
{
    public async Task<Result<string>> Handle(BulkPermanentDeleteInvoicesCommand request, CancellationToken cancellationToken)
    {
        // IgnoreQueryFilters() ile query filter'ı bypass ediyoruz (silinen faturaları bulabilmek için)
        List<Invoice> invoices = await invoiceRepository
            .GetAll()
            .IgnoreQueryFilters()
            .Where(p => request.Ids.Contains(p.Id) && p.IsDeleted)
            .ToListAsync(cancellationToken);

        if (invoices.Count == 0)
        {
            return Result<string>.Failure("Silinecek fatura bulunamadı");
        }

        // Collect all customer detail IDs and product detail IDs to permanently delete
        List<Guid> customerDetailIds = new List<Guid>();
        List<Guid> productDetailIds = new List<Guid>();
        List<Guid> invoicePaymentIds = new List<Guid>();
        List<Guid> cashRegisterDetailIds = new List<Guid>();

        foreach (var invoice in invoices)
        {
            CustomerDetail? customerDetail = await customerDetailRepository
                .GetAll()
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(p => p.InvoiceId == invoice.Id && p.IsDeleted, cancellationToken);

            if (customerDetail is not null)
            {
                customerDetailIds.Add(customerDetail.Id);
            }

            // Find invoice payments
            List<CustomerDetail> invoicePayments = await customerDetailRepository
                .GetAll()
                .IgnoreQueryFilters()
                .Where(p => p.InvoiceId == invoice.Id && p.Type == CustomerDetailTypeEnum.InvoicePayment && p.IsDeleted)
                .ToListAsync(cancellationToken);

            invoicePaymentIds.AddRange(invoicePayments.Select(p => p.Id));

            // Find cash register details
            List<CashRegisterDetail> cashRegisterDetails = await cashRegisterDetailRepository
                .GetAll()
                .IgnoreQueryFilters()
                .Where(p => p.Description.Contains($"{invoice.InvoiceNumber} Numaralı Fatura") && p.IsDeleted)
                .ToListAsync(cancellationToken);

            cashRegisterDetailIds.AddRange(cashRegisterDetails.Select(crd => crd.Id));

            List<ProductDetail> productDetails = await productDetailRepository
                .GetAll()
                .IgnoreQueryFilters()
                .Where(p => p.InvoiceId == invoice.Id && p.IsDeleted)
                .ToListAsync(cancellationToken);

            productDetailIds.AddRange(productDetails.Select(pd => pd.Id));
        }

        // Permanently delete the customer details
        if (customerDetailIds.Any())
        {
            List<CustomerDetail> customerDetails = await customerDetailRepository
                .GetAll()
                .IgnoreQueryFilters()
                .Where(p => customerDetailIds.Contains(p.Id))
                .ToListAsync(cancellationToken);
            
            if (customerDetails.Any())
            {
                customerDetailRepository.DeleteRange(customerDetails);
            }
        }

        // Permanently delete invoice payments
        if (invoicePaymentIds.Any())
        {
            List<CustomerDetail> invoicePayments = await customerDetailRepository
                .GetAll()
                .IgnoreQueryFilters()
                .Where(p => invoicePaymentIds.Contains(p.Id))
                .ToListAsync(cancellationToken);
            
            if (invoicePayments.Any())
            {
                customerDetailRepository.DeleteRange(invoicePayments);
            }
        }

        // Permanently delete cash register details
        if (cashRegisterDetailIds.Any())
        {
            List<CashRegisterDetail> cashRegisterDetails = await cashRegisterDetailRepository
                .GetAll()
                .IgnoreQueryFilters()
                .Where(p => cashRegisterDetailIds.Contains(p.Id))
                .ToListAsync(cancellationToken);
            
            if (cashRegisterDetails.Any())
            {
                cashRegisterDetailRepository.DeleteRange(cashRegisterDetails);
            }
        }

        // Permanently delete the product details
        if (productDetailIds.Any())
        {
            List<ProductDetail> productDetails = await productDetailRepository
                .GetAll()
                .IgnoreQueryFilters()
                .Where(p => productDetailIds.Contains(p.Id))
                .ToListAsync(cancellationToken);
            
            if (productDetails.Any())
            {
                productDetailRepository.DeleteRange(productDetails);
            }
        }

        invoiceRepository.DeleteRange(invoices);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        cacheService.Remove(cacheService.GetCompanyCacheKey("invoices"));
        cacheService.Remove(cacheService.GetCompanyCacheKey("customers"));
        cacheService.Remove(cacheService.GetCompanyCacheKey("products"));
        cacheService.Remove(cacheService.GetCompanyCacheKey("cashRegisters"));

        return $"{invoices.Count} fatura kalıcı olarak silindi";
    }
}