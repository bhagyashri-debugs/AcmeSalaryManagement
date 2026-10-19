
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

    // GET: api/employees
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Employee>>> GetEmployees()
    {
        var employees = await _employeeService.GetAllAsync();
        return Ok(employees);
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
    public async Task<ActionResult<Employee>> CreateEmployee(Employee employee)
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
        int id, Employee updatedEmployee)
    {
        var employee = await _employeeService.GetByIdAsync(id);

        if (employee == null)
            return NotFound();

        var existingEmployee =
            await _employeeService.GetByEmailAsync(updatedEmployee.Email);

        if (existingEmployee != null && existingEmployee.Id != id)
        {
            return Conflict(new
            {
                message = "An employee with this email already exists."
            });
        }

        var updated = await _employeeService.UpdateAsync(id, updatedEmployee);

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
