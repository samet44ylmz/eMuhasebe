using eMuhasebeServer.Application.Features.Banks.CreateBank;
using eMuhasebeServer.Application.Features.Banks.DeleteBankById;
using eMuhasebeServer.Application.Features.Banks.GetAllBanks;
using eMuhasebeServer.Application.Features.Banks.UpdateBank;
using eMuhasebeServer.Application.Features.Invoices.CreateInvoice;
using eMuhasebeServer.Application.Features.Invoices.DeleteInvoiceById;
using eMuhasebeServer.Application.Features.Invoices.GetAllInvoices;
using eMuhasebeServer.Application.Features.Invoices.GetAllDeletedInvoices;
using eMuhasebeServer.Application.Features.Invoices.RestoreInvoice;
using eMuhasebeServer.Application.Features.Invoices.PermanentDeleteInvoice;
using eMuhasebeServer.Application.Features.Invoices.BulkRestoreInvoices;
using eMuhasebeServer.Application.Features.Invoices.BulkPermanentDeleteInvoices;
using eMuhasebeServer.Application.Features.Invoices.PayInvoice;
using eMuhasebeServer.WebAPI.Abstractions;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace eMuhasebeServer.WebAPI.Controllers
{
  
    public sealed class InvoicesController : ApiController
    {
        public InvoicesController(IMediator mediator) : base(mediator)
        {
        }

        [HttpPost]

        public async Task<IActionResult> GetAll(GetAllInvoicesQuery request, CancellationToken cancellationToken)
        {
            var response = await _mediator.Send(request, cancellationToken);
            return StatusCode(response.StatusCode, response);
        }

        [HttpPost]

        public async Task<IActionResult> Create(CreateInvoiceCommand request, CancellationToken cancellationToken)
        {
            var response = await _mediator.Send(request, cancellationToken);
            return StatusCode(response.StatusCode, response);
        }
       

        [HttpPost]

        public async Task<IActionResult> DeleteById(DeleteInvoiceByIdCommand request, CancellationToken cancellationToken)
        {
            var response = await _mediator.Send(request, cancellationToken);
            return StatusCode(response.StatusCode, response);
        }

        [HttpPost]
        public async Task<IActionResult> GetAllDeleted(GetAllDeletedInvoicesQuery request, CancellationToken cancellationToken)
        {
            var response = await _mediator.Send(request, cancellationToken);
            return StatusCode(response.StatusCode, response);
        }

        [HttpPost]
        public async Task<IActionResult> Restore(RestoreInvoiceCommand request, CancellationToken cancellationToken)
        {
            var response = await _mediator.Send(request, cancellationToken);
            return StatusCode(response.StatusCode, response);
        }

        [HttpPost]
        public async Task<IActionResult> PermanentDelete(PermanentDeleteInvoiceCommand request, CancellationToken cancellationToken)
        {
            var response = await _mediator.Send(request, cancellationToken);
            return StatusCode(response.StatusCode, response);
        }

        [HttpPost]
        public async Task<IActionResult> BulkRestore(BulkRestoreInvoicesCommand request, CancellationToken cancellationToken)
        {
            var response = await _mediator.Send(request, cancellationToken);
            return StatusCode(response.StatusCode, response);
        }

        [HttpPost]
        public async Task<IActionResult> BulkPermanentDelete(BulkPermanentDeleteInvoicesCommand request, CancellationToken cancellationToken)
        {
            var response = await _mediator.Send(request, cancellationToken);
            return StatusCode(response.StatusCode, response);
        }

        [HttpPost]
        public async Task<IActionResult> Pay(PayInvoiceCommand request, CancellationToken cancellationToken)
        {
            var response = await _mediator.Send(request, cancellationToken);
            return StatusCode(response.StatusCode, response);
        }
    }
}