
using eMuhasebeServer.Application.Features.Employees.CreateEmployee;
using eMuhasebeServer.Application.Features.Employees.DeleteEmployeeById;
using eMuhasebeServer.Application.Features.Employees.GetAllEmployees;
using eMuhasebeServer.Application.Features.Employees.UpdateEmployee;
using eMuhasebeServer.Application.Features.Employees.GetAllDeletedEmployees;
using eMuhasebeServer.Application.Features.Employees.RestoreEmployee;
using eMuhasebeServer.Application.Features.Employees.PermanentDeleteEmployee;
using eMuhasebeServer.Application.Features.Employees.BulkRestoreEmployees;
using eMuhasebeServer.Application.Features.Employees.BulkPermanentDeleteEmployees;
using eMuhasebeServer.WebAPI.Abstractions;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace eMuhasebeServer.WebAPI.Controllers;

    public class EmployeesController : ApiController
{
    public EmployeesController(IMediator mediator) : base(mediator)
    {
    }

    [HttpPost]
    public async Task<IActionResult> GetAll(GetAllEmployeesQuery request, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(request, cancellationToken);
        return StatusCode(response.StatusCode, response);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateEmployeeCommand request, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(request, cancellationToken);
        return StatusCode(response.StatusCode, response);
    }

    [HttpPost]
    public async Task<IActionResult> Update(UpdateEmployeeCommand request, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(request, cancellationToken);
        return StatusCode(response.StatusCode, response);
    }

    [HttpPost]
    public async Task<IActionResult> DeleteById(DeleteEmployeeByIdCommand request, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(request, cancellationToken);
        return StatusCode(response.StatusCode, response);
    }

    [HttpPost]
    public async Task<IActionResult> GetAllDeleted(GetAllDeletedEmployeesQuery request, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(request, cancellationToken);
        return StatusCode(response.StatusCode, response);
    }

    [HttpPost]
    public async Task<IActionResult> Restore(RestoreEmployeeCommand request, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(request, cancellationToken);
        return StatusCode(response.StatusCode, response);
    }

    [HttpPost]
    public async Task<IActionResult> PermanentDelete(PermanentDeleteEmployeeCommand request, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(request, cancellationToken);
        return StatusCode(response.StatusCode, response);
    }

    [HttpPost]
    public async Task<IActionResult> BulkRestore(BulkRestoreEmployeesCommand request, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(request, cancellationToken);
        return StatusCode(response.StatusCode, response);
    }

    [HttpPost]
    public async Task<IActionResult> BulkPermanentDelete(BulkPermanentDeleteEmployeesCommand request, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(request, cancellationToken);
        return StatusCode(response.StatusCode, response);
    }

  
}