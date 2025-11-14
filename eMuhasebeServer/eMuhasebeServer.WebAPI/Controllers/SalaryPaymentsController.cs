using eMuhasebeServer.Application.Features.SalaryPayments.CreateSalaryPayment;
using eMuhasebeServer.Application.Features.SalaryPayments.DeleteSalaryPaymentById;
using eMuhasebeServer.Application.Features.SalaryPayments.GetAllSalaryPayments;
using eMuhasebeServer.Application.Features.SalaryPayments.UpdateSalaryPayment;
using eMuhasebeServer.Application.Features.SalaryPayments.GetSalaryPaymentsByEmployeeId;
using eMuhasebeServer.WebAPI.Abstractions;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace eMuhasebeServer.WebAPI.Controllers
{
  
    public sealed class SalaryPaymentsController : ApiController
    {
        public SalaryPaymentsController(IMediator mediator) : base(mediator)
        {
        }

        [HttpPost]
        public async Task<IActionResult> GetAll(GetAllSalaryPaymentsQuery request, CancellationToken cancellationToken)
        {
            var response = await _mediator.Send(request, cancellationToken);
            return StatusCode(response.StatusCode, response);
        }

        [HttpPost]
        public async Task<IActionResult> GetByEmployeeId(GetSalaryPaymentsByEmployeeIdQuery request, CancellationToken cancellationToken)
        {
            var response = await _mediator.Send(request, cancellationToken);
            return StatusCode(response.StatusCode, response);
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateSalaryPaymentCommand request, CancellationToken cancellationToken)
        {
            var response = await _mediator.Send(request, cancellationToken);
            return StatusCode(response.StatusCode, response);
        }

        [HttpPost]
        public async Task<IActionResult> Update(UpdateSalaryPaymentCommand request, CancellationToken cancellationToken)
        {
            var response = await _mediator.Send(request, cancellationToken);
            return StatusCode(response.StatusCode, response);
        }

        [HttpPost]
        public async Task<IActionResult> DeleteById(DeleteSalaryPaymentByIdCommand request, CancellationToken cancellationToken)
        {
            var response = await _mediator.Send(request, cancellationToken);
            return StatusCode(response.StatusCode, response);
        }
}
}