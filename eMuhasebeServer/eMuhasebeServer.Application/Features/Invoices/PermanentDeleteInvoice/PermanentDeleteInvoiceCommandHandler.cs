using eMuhasebeServer.Application.Services;
using eMuhasebeServer.Domain.Entities;
using eMuhasebeServer.Domain.Repositories;
using GenericRepository;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Invoices.PermanentDeleteInvoice;

internal sealed class PermanentDeleteInvoiceCommandHandler(
    IInvoiceRepository invoiceRepository,
    ICustomerDetailRepository customerDetailRepository,
    IProductDetailRepository productDetailRepository,
    IUnitOfWork unitOfWork,
    ICacheService cacheService) : IRequestHandler<PermanentDeleteInvoiceCommand, Result<string>>
{
    public async Task<Result<string>> Handle(PermanentDeleteInvoiceCommand request, CancellationToken cancellationToken)
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
            return Result<string>.Failure("Önce fatura kaydını silmeniz gerekir");
        }

        // Permanently delete the customer detail associated with this invoice
        CustomerDetail? customerDetail = await customerDetailRepository
            .GetAll()
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(p => p.InvoiceId == request.Id && p.IsDeleted, cancellationToken);

        if (customerDetail is not null)
        {
            customerDetailRepository.Delete(customerDetail);
        }

        // Permanently delete the product details
        List<ProductDetail> productDetails = await productDetailRepository
            .GetAll()
            .IgnoreQueryFilters()
            .Where(p => p.InvoiceId == invoice.Id && p.IsDeleted)
            .ToListAsync(cancellationToken);

        if (productDetails.Any())
        {
            productDetailRepository.DeleteRange(productDetails);
        }

        invoiceRepository.Delete(invoice);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        cacheService.Remove(cacheService.GetCompanyCacheKey("invoices"));
        cacheService.Remove(cacheService.GetCompanyCacheKey("customers"));
        cacheService.Remove(cacheService.GetCompanyCacheKey("products"));

        return "Fatura kaydı kalıcı olarak silindi";
    }
}