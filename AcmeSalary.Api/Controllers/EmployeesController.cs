
using Microsoft.AspNetCore.Mvc;
using AcmeSalary.Api.Models;
using AcmeSalary.Api.Services;

namespace AcmeSalary.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EmployeesController : ControllerBase
{
    private readonly IEmployeeService _employeeService;

    public EmployeesController(IEmployeeService employeeService)
    {
        _employeeService = employeeService;
    }
    // GET: api/employees/summary
    [HttpGet("summary")]
    public async Task<IActionResult> GetDashboardSummary()
    {
    var summary = await _employeeService.GetDashboardSummaryAsync();
    return Ok(summary);
    }
    // GET: api/employees?page=1&pageSize=20
    // Supports search, filters, sorting, and server-side pagination.
    [HttpGet]
    public async Task<ActionResult<object>> GetEmployees(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] string? country = null,
        [FromQuery] string? department = null,
        [FromQuery] string? jobTitle = null,
        [FromQuery] string? sortBy = null,
        [FromQuery] string? sortOrder = null)
    {
        if (page < 1)
        {
            return BadRequest(new
            {
                message = "Page must be greater than or equal to 1."
            });
        }

        if (pageSize < 1 || pageSize > 100)
        {
            return BadRequest(new
            {
                message = "Page size must be between 1 and 100."
            });
        }

        var result = await _employeeService.GetPagedAsync(
            page,
            pageSize,
            search,
            country,
            department,
            jobTitle,
            sortBy,
            sortOrder);

        return Ok(new
        {
            data = result.Employees,
            page,
            pageSize,
            totalCount = result.TotalCount,
            totalPages = (int)Math.Ceiling(
                result.TotalCount / (double)pageSize)
        });
    }

    // GET: api/employees/1
    [HttpGet("{id:int}")]
    public async Task<ActionResult<Employee>> GetEmployee(int id)
    {
        var employee = await _employeeService.GetByIdAsync(id);

        if (employee == null)
            return NotFound();

        return Ok(employee);
    }

    // POST: api/employees
    [HttpPost]
    public async Task<ActionResult<Employee>> CreateEmployee(
        Employee employee)
    {
        var existingEmployee =
            await _employeeService.GetByEmailAsync(employee.Email);

        if (existingEmployee != null)
        {
            return Conflict(new
            {
                message = "An employee with this email already exists."
            });
        }

        var createdEmployee = await _employeeService.CreateAsync(employee);

        return CreatedAtAction(
            nameof(GetEmployee),
            new { id = createdEmployee.Id },
            createdEmployee);
    }

    // PUT: api/employees/1
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateEmployee(
        int id,
        Employee updatedEmployee)
    {
        var employee = await _employeeService.GetByIdAsync(id);

        if (employee == null)
            return NotFound();

        updatedEmployee.Email = updatedEmployee.Email.Trim();

        var existingEmployee =
            await _employeeService.GetByEmailAsync(updatedEmployee.Email);

        if (existingEmployee != null && existingEmployee.Id != id)
        {
            return Conflict(new
            {
                message = "An employee with this email already exists."
            });
        }

        var updated = await _employeeService.UpdateAsync(
            id, updatedEmployee);

        if (!updated)
            return NotFound();

        return NoContent();
    }

    // DELETE: api/employees/1
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteEmployee(int id)
    {
        var deleted = await _employeeService.DeleteAsync(id);

        if (!deleted)
            return NotFound();

        return NoContent();
    }
}
