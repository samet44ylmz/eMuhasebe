using eMuhasebeServer.Application.Features.BankDetails.CreateBankDetail;
using eMuhasebeServer.Application.Features.BankDetails.DeleteBankById;
using eMuhasebeServer.Application.Features.BankDetails.GetAllBankDetails;
using eMuhasebeServer.Application.Features.BankDetails.UpdateBankDetail;
using eMuhasebeServer.Application.Features.Banks.CreateBank;
using eMuhasebeServer.Application.Features.Banks.DeleteBankById;
using eMuhasebeServer.Application.Features.Banks.GetAllBanks;
using eMuhasebeServer.Application.Features.Banks.UpdateBank;
using eMuhasebeServer.WebAPI.Abstractions;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace eMuhasebeServer.WebAPI.Controllers
{
  
    public sealed class BankDetailsController : ApiController
    {
        public BankDetailsController(IMediator mediator) : base(mediator)
        {
        }

        [HttpPost]

        public async Task<IActionResult> GetAll(GetAllBankDetailsQuery request, CancellationToken cancellationToken)
        {
            var response = await _mediator.Send(request, cancellationToken);
            return StatusCode(response.StatusCode, response);
        }

        [HttpPost]

        public async Task<IActionResult> Create(CreateBankDetailCommand request, CancellationToken cancellationToken)
        {
            var response = await _mediator.Send(request, cancellationToken);
            return StatusCode(response.StatusCode, response);
        }

        [HttpPost]

        public async Task<IActionResult> Update(UpdateBankDetailCommand request, CancellationToken cancellationToken)
        {
            var response = await _mediator.Send(request, cancellationToken);
            return StatusCode(response.StatusCode, response);
        }

        [HttpPost]

        public async Task<IActionResult> DeleteById(DeleteBankDetailByIdCommand request, CancellationToken cancellationToken)
        {
            var response = await _mediator.Send(request, cancellationToken);
            return StatusCode(response.StatusCode, response);
        }
    }
}

