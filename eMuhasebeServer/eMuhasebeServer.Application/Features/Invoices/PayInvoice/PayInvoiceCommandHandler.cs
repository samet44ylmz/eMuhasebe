using eMuhasebeServer.Application.Services;
using eMuhasebeServer.Domain.Entities;
using eMuhasebeServer.Domain.Enums;
using eMuhasebeServer.Domain.Repositories;
using GenericRepository;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Invoices.PayInvoice;

internal sealed class PayInvoiceCommandHandler(
    IInvoiceRepository invoiceRepository,
    ICustomerRepository customerRepository,
    ICustomerDetailRepository customerDetailRepository,
    ICashRegisterRepository cashRegisterRepository,
    ICashRegisterDetailRepository cashRegisterDetailRepository,
    IUnitOfWork unitOfWork,
    ICacheService cacheService) : IRequestHandler<PayInvoiceCommand, Result<string>>
{
    public async Task<Result<string>> Handle(PayInvoiceCommand request, CancellationToken cancellationToken)
    {
        // Get the invoice
        Invoice? invoice = await invoiceRepository
            .GetAll()
            .Include(p => p.Customer)
            .FirstOrDefaultAsync(p => p.Id == request.InvoiceId, cancellationToken);

        if (invoice is null)
        {
            return Result<string>.Failure("Fatura bulunamadı");
        }

        // Check if the payment amount is valid
        if (request.PaymentAmount <= 0)
        {
            return Result<string>.Failure("Ödeme tutarı 0'dan büyük olmalıdır");
        }

        // Check if the payment would exceed the invoice amount
        if (invoice.PaidAmount + request.PaymentAmount > invoice.Amount)
        {
            return Result<string>.Failure("Ödeme tutarı fatura tutarını aşamaz");
        }

        // Update the paid amount
        invoice.PaidAmount += request.PaymentAmount;
        invoiceRepository.Update(invoice);

        // Update customer amounts
        Customer? customer = await customerRepository
            .GetByExpressionWithTrackingAsync(p => p.Id == invoice.CustomerId, cancellationToken);

        if (customer is not null)
        {
            // For purchase invoices (Type 1), we decrease the withdrawal amount (money going out)
            // For sales invoices (Type 2), we increase the deposit amount (money coming in)
            if (invoice.Type.Value == 1) // Purchase invoice
            {
                customer.WithdrawalAmount += request.PaymentAmount;
            }
            else if (invoice.Type.Value == 2) // Sales invoice
            {
                customer.DepositAmount += request.PaymentAmount;
            }

            customerRepository.Update(customer);
        }

        // Create customer detail record for the payment
        CustomerDetail customerDetail = new()
        {
            CustomerId = invoice.CustomerId,
            Date = request.PaymentDate,
            DepositAmount = invoice.Type.Value == 2 ? request.PaymentAmount : 0, // Sales invoice deposit
            WithdrawalAmount = invoice.Type.Value == 1 ? request.PaymentAmount : 0, // Purchase invoice withdrawal
            Description = $"{invoice.InvoiceNumber} Numaralı Fatura Ödemesi - {request.Description}",
            Type = CustomerDetailTypeEnum.InvoicePayment,
            InvoiceId = invoice.Id
        };

        await customerDetailRepository.AddAsync(customerDetail, cancellationToken);

        // If a cash register is specified, update it
        if (request.CashRegisterId.HasValue)
        {
            CashRegister? cashRegister = await cashRegisterRepository
                .GetByExpressionWithTrackingAsync(p => p.Id == request.CashRegisterId.Value, cancellationToken);

            if (cashRegister is not null)
            {
                // For purchase invoices, money is coming in (deposit) - changed from withdrawal to deposit
                // For sales invoices, money is coming in (deposit)
                if (invoice.Type.Value == 1) // Purchase invoice
                {
                    cashRegister.DepositAmount += request.PaymentAmount; // Changed from WithdrawalAmount to DepositAmount
                }
                else if (invoice.Type.Value == 2) // Sales invoice
                {
                    cashRegister.DepositAmount += request.PaymentAmount;
                }
                // Removed explicit Update call as we're using tracking

                // Create cash register detail record
                CashRegisterDetail cashRegisterDetail = new()
                {
                    CashRegisterId = cashRegister.Id,
                    Date = request.PaymentDate,
                    Description = $"{invoice.InvoiceNumber} Numaralı Fatura Ödemesi - {request.Description}",
                    DepositAmount = request.PaymentAmount, // Always deposit for payments
                    WithdrawalAmount = 0 // No withdrawal for payments
                };

                await cashRegisterDetailRepository.AddAsync(cashRegisterDetail, cancellationToken);
            }
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);

        // Clear caches
        cacheService.Remove(cacheService.GetCompanyCacheKey("invoices"));
        cacheService.Remove(cacheService.GetCompanyCacheKey("customers"));
        cacheService.Remove(cacheService.GetCompanyCacheKey("cashRegisters"));

        return "Fatura ödemesi başarıyla kaydedildi";
    }
}