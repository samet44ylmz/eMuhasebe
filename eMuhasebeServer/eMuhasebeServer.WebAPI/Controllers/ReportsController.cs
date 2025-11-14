using eMuhasebeServer.Application.Features.Reports.ProductProfitabilityReports;
using eMuhasebeServer.Application.Features.Reports.CashRegisterBalanceReports;
using eMuhasebeServer.Application.Features.Reports.CustomerCount;
using eMuhasebeServer.Application.Features.Reports.ProductCount;
using eMuhasebeServer.Application.Features.Reports.InvoiceBalanceReports;
using eMuhasebeServer.Application.Features.Reports.ExpenseBalanceReports;
using eMuhasebeServer.Application.Features.Reports.BankBalanceReports;
using eMuhasebeServer.Application.Features.Reports.RecentBankTransactions;
using eMuhasebeServer.Application.Features.Reports.RecentCashTransactions;
using eMuhasebeServer.WebAPI.Abstractions;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace eMuhasebeServer.WebAPI.Controllers;

public sealed class ReportsController : ApiController
{
    public ReportsController(IMediator mediator) : base(mediator)
    {
    }

    [HttpPost]
    public async Task<IActionResult> GetProductProfitabilityReports(ProductProfitabilityReportsQuery request, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(request, cancellationToken);
        return StatusCode(response.StatusCode, response);
    }

    [HttpPost]
    public async Task<IActionResult> GetCashRegisterBalanceReports(CashRegisterBalanceReportsQuery request, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(request, cancellationToken);
        return StatusCode(response.StatusCode, response);
    }

    [HttpPost]
    public async Task<IActionResult> GetCustomerCount(CustomerCountQuery request, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(request, cancellationToken);
        return StatusCode(response.StatusCode, response);
    }

    [HttpPost]
    public async Task<IActionResult> GetProductCount(ProductCountQuery request, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(request, cancellationToken);
        return StatusCode(response.StatusCode, response);
    }

    [HttpPost]
    public async Task<IActionResult> GetInvoiceBalanceReports(InvoiceBalanceReportsQuery request, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(request, cancellationToken);
        return StatusCode(response.StatusCode, response);
    }

    [HttpPost]
    public async Task<IActionResult> GetExpenseBalanceReports(ExpenseBalanceReportsQuery request, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(request, cancellationToken);
        return StatusCode(response.StatusCode, response);
    }

    [HttpPost]
    public async Task<IActionResult> GetBankBalanceReports(BankBalanceReportsQuery request, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(request, cancellationToken);
        return StatusCode(response.StatusCode, response);
    }

    [HttpPost]
    public async Task<IActionResult> GetRecentBankTransactions(RecentBankTransactionsQuery request, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(request, cancellationToken);
        return StatusCode(response.StatusCode, response);
    }

    [HttpPost]
    public async Task<IActionResult> GetRecentCashTransactions(RecentCashTransactionsQuery request, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(request, cancellationToken);
        return StatusCode(response.StatusCode, response);
    }
}