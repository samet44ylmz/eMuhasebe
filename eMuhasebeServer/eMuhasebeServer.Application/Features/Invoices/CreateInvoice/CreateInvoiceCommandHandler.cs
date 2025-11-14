using AutoMapper;
using eMuhasebeServer.Application.Hubs;
using eMuhasebeServer.Application.Services;
using eMuhasebeServer.Domain.Entities;
using eMuhasebeServer.Domain.Enums;
using eMuhasebeServer.Domain.Repositories;
using GenericRepository;
using MediatR;
using Microsoft.AspNetCore.SignalR;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Invoices.CreateInvoice;

internal sealed class CreateInvoiceCommandHandler(
    IInvoiceRepository invoiceRepository,
    IProductRepository productRepository,
    IProductDetailRepository productDetailRepository,
    ICustomerRepository customerRepository,
    ICustomerDetailRepository customerDetailRepository,
    IUnitOfWork unitOfWork,
    ICacheService cacheService,
    IMapper mapper,
    IHubContext<ReportHub> hubContext
    ) : IRequestHandler<CreateInvoiceCommand, Result<string>>
{
    public async Task<Result<string>> Handle(CreateInvoiceCommand request, CancellationToken cancellationToken)
    {
        #region Fatura ve detay
        Invoice invoice = mapper.Map<Invoice>(request);
        invoice.Type = InvoiceTypeEnum.Purchase; // Default type since we removed type selection
        invoice.PaidAmount = 0; // Initialize paid amount to 0
        
        // Generate a default invoice number if none provided
        if (string.IsNullOrWhiteSpace(invoice.InvoiceNumber))
        {
            invoice.InvoiceNumber = "FAT-" + DateTime.Now.ToString("yyyyMMddHHmmss");
        }
        
        await invoiceRepository.AddAsync(invoice, cancellationToken);
        #endregion

        #region Customer
        Customer? customer = await customerRepository.GetByExpressionAsync(p => p.Id == request.CustomerId, cancellationToken);

        if (customer is null)
        {
            return Result<string>.Failure("Müşteri bulunamadı");
        }

        customer.DepositAmount += invoice.Amount;

        customerRepository.Update(customer);

        CustomerDetail customerDetail = new()
        {
            CustomerId = customer.Id,
            Date = request.Date,
            DepositAmount = invoice.Amount,
            WithdrawalAmount = 0,
            Description = string.IsNullOrWhiteSpace(request.InvoiceNumber) ? "Fatura" : request.InvoiceNumber + " Numaralı Fatura",
            Type = CustomerDetailTypeEnum.PurchaseInvoice,
            InvoiceId = invoice.Id
        };

        await customerDetailRepository.AddAsync(customerDetail, cancellationToken);
        #endregion

        #region Product        
        foreach (var item in request.Details)
        {
            Product product = await productRepository.GetByExpressionAsync(p => p.Id == item.ProductId, cancellationToken);

            product.Deposit += item.Quantity;

            productRepository.Update(product);

            ProductDetail productDetail = new()
            {
                ProductId = product.Id,
                Date = request.Date,
                Description = invoice.Description,
                Deposit = item.Quantity,
                Withdrawal = 0,
                InvoiceId = invoice.Id,
                Price = item.Price
            };

            await productDetailRepository.AddAsync(productDetail, cancellationToken);
        }
        #endregion

        await unitOfWork.SaveChangesAsync(cancellationToken);

        cacheService.Remove(cacheService.GetCompanyCacheKey("invoices"));
        cacheService.Remove(cacheService.GetCompanyCacheKey("customers"));
        cacheService.Remove(cacheService.GetCompanyCacheKey("products"));

        await hubContext.Clients.All.SendAsync("PurchaseRepors", new { Date = invoice.Date, Amount = invoice.Amount });

        return "Fatura kaydı başarıyla tamamlandı";
    }
}