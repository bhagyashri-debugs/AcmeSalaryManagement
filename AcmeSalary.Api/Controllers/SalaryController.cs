
using AcmeSalary.Api.Models;
using AcmeSalary.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace AcmeSalary.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SalaryController : ControllerBase
{
    private readonly IEmployeeService _employeeService;
    private readonly SalaryService _salaryService;

    public SalaryController(
        IEmployeeService employeeService,
        SalaryService salaryService)
    {
        _employeeService = employeeService;
        _salaryService = salaryService;
    }

    // GET: api/salary/1
    [HttpGet("{employeeId:int}")]
    public async Task<ActionResult<SalaryDetails>> GetSalary(int employeeId)
    {
        var employee = await _employeeService.GetByIdAsync(employeeId);

        if (employee == null)
            return NotFound("Employee not found.");

        var salaryDetails = _salaryService.CalculateSalary(employee);

        return Ok(salaryDetails);
    }
}
