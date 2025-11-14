using eMuhasebeServer.Application.Features.EmloyeeDetails;
using eMuhasebeServer.Application.Features.ProductDetails.GetAllProductDetails;
using eMuhasebeServer.WebAPI.Abstractions;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace eMuhasebeServer.WebAPI.Controllers;


public sealed class EmployeeDetailsController : ApiController
{
    public EmployeeDetailsController(IMediator mediator) : base(mediator)
    {
    }

    [HttpPost]

    public async Task<IActionResult> GetAll(GetAllEmployeeDetailsQuery request, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(request, cancellationToken);
        return StatusCode(response.StatusCode, response);
    }

} 

