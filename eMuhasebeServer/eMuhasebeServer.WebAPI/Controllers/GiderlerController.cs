using eMuhasebeServer.Application.Features.Giderler.CreateGider;
using eMuhasebeServer.Application.Features.Giderler.DeleteGiderById;
using eMuhasebeServer.Application.Features.Giderler.GetAllGiderler;
using eMuhasebeServer.Application.Features.Giderler.UpdateGider;
using eMuhasebeServer.Application.Features.Giderler.GetAllDeletedGiderler;
using eMuhasebeServer.Application.Features.Giderler.RestoreGider;
using eMuhasebeServer.Application.Features.Giderler.PermanentDeleteGider;
using eMuhasebeServer.Application.Features.Giderler.BulkRestoreGiderler;
using eMuhasebeServer.Application.Features.Giderler.BulkPermanentDeleteGiderler;
using eMuhasebeServer.Application.Features.Giderler.PayExpense;
using eMuhasebeServer.WebAPI.Abstractions;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace eMuhasebeServer.WebAPI.Controllers;
  
public sealed class GiderlerController : ApiController
{
    public GiderlerController(IMediator mediator) : base(mediator)
    {
    }

    [HttpPost]
    public async Task<IActionResult> GetAll(GetAllGiderlerQuery request, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(request, cancellationToken);
        return StatusCode(response.StatusCode, response);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateGiderCommand request, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(request, cancellationToken);
        return StatusCode(response.StatusCode, response);
    }

    [HttpPost]
    public async Task<IActionResult> Update(UpdateGiderCommand request, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(request, cancellationToken);
        return StatusCode(response.StatusCode, response);
    }

    [HttpPost]
    public async Task<IActionResult> DeleteById(DeleteGiderByIdCommand request, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(request, cancellationToken);
        return StatusCode(response.StatusCode, response);
    }

    [HttpPost]
    public async Task<IActionResult> GetAllDeleted(GetAllDeletedGiderlerQuery request, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(request, cancellationToken);
        return StatusCode(response.StatusCode, response);
    }

    [HttpPost]
    public async Task<IActionResult> Restore(RestoreGiderCommand request, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(request, cancellationToken);
        return StatusCode(response.StatusCode, response);
    }

    [HttpPost]
    public async Task<IActionResult> PermanentDelete(PermanentDeleteGiderCommand request, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(request, cancellationToken);
        return StatusCode(response.StatusCode, response);
    }

    [HttpPost]
    public async Task<IActionResult> BulkRestore(BulkRestoreGiderlerCommand request, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(request, cancellationToken);
        return StatusCode(response.StatusCode, response);
    }

    [HttpPost]
    public async Task<IActionResult> BulkPermanentDelete(BulkPermanentDeleteGiderlerCommand request, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(request, cancellationToken);
        return StatusCode(response.StatusCode, response);
    }

    [HttpPost]
    public async Task<IActionResult> Pay(PayExpenseCommand request, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(request, cancellationToken);
        return StatusCode(response.StatusCode, response);
    }
}