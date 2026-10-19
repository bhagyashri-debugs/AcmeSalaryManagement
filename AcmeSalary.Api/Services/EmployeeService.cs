
using AcmeSalary.Api.Data;
using AcmeSalary.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace AcmeSalary.Api.Services;

public class EmployeeService : IEmployeeService
{
    private readonly AppDbContext _context;

    public EmployeeService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Employee>> GetAllAsync()
    {
        return await _context.Employees.ToListAsync();
    }

    public async Task<Employee?> GetByIdAsync(int id)
    {
        return await _context.Employees.FindAsync(id);
    }

    public async Task<Employee?> GetByEmailAsync(string email)
    {
        var normalizedEmail = email.Trim().ToLower();

        return await _context.Employees.FirstOrDefaultAsync(
            e => e.Email.ToLower() == normalizedEmail);
    }

    public async Task<Employee> CreateAsync(Employee employee)
    {
        employee.Email = employee.Email.Trim();

        _context.Employees.Add(employee);
        await _context.SaveChangesAsync();

        return employee;
    }

    public async Task<bool> UpdateAsync(int id, Employee updatedEmployee)
    {
        var employee = await _context.Employees.FindAsync(id);

        if (employee == null)
            return false;

        employee.Name = updatedEmployee.Name;
        employee.Email = updatedEmployee.Email.Trim();
        employee.Department = updatedEmployee.Department;
        employee.BasicSalary = updatedEmployee.BasicSalary;

        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var employee = await _context.Employees.FindAsync(id);

        if (employee == null)
            return false;

        _context.Employees.Remove(employee);
        await _context.SaveChangesAsync();

        return true;
    }
}
