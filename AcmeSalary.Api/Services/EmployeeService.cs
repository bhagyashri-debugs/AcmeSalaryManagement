
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
        return await _context.Employees
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<(List<Employee> Employees, int TotalCount)> GetPagedAsync(
        int page,
        int pageSize,
        string? search = null,
        string? country = null,
        string? department = null,
        string? jobTitle = null,
        string? sortBy = null,
        string? sortOrder = null)
    {
        IQueryable<Employee> query =
            _context.Employees.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();

            query = query.Where(employee =>
                employee.Name.ToLower().Contains(term) ||
                employee.Email.ToLower().Contains(term));
        }

        if (!string.IsNullOrWhiteSpace(country))
        {
            query = query.Where(employee =>
                employee.Country == country);
        }

        if (!string.IsNullOrWhiteSpace(department))
        {
            query = query.Where(employee =>
                employee.Department == department);
        }

        if (!string.IsNullOrWhiteSpace(jobTitle))
        {
            query = query.Where(employee =>
                employee.JobTitle == jobTitle);
        }

        var totalCount = await query.CountAsync();

        var descending = string.Equals(
            sortOrder,
            "desc",
            StringComparison.OrdinalIgnoreCase);

        IOrderedQueryable<Employee> orderedQuery =
            (sortBy?.ToLowerInvariant()) switch
            {
                "name" => descending
                    ? query.OrderByDescending(employee => employee.Name)
                    : query.OrderBy(employee => employee.Name),

                "email" => descending
                    ? query.OrderByDescending(employee => employee.Email)
                    : query.OrderBy(employee => employee.Email),

                "country" => descending
                    ? query.OrderByDescending(employee => employee.Country)
                    : query.OrderBy(employee => employee.Country),

                "department" => descending
                    ? query.OrderByDescending(employee => employee.Department)
                    : query.OrderBy(employee => employee.Department),

                "jobtitle" => descending
                    ? query.OrderByDescending(employee => employee.JobTitle)
                    : query.OrderBy(employee => employee.JobTitle),

                "basicsalary" => descending
                    ? query.OrderByDescending(employee => employee.BasicSalary)
                    : query.OrderBy(employee => employee.BasicSalary),

                _ => query.OrderBy(employee => employee.Id)
            };

        var employees = await orderedQuery
            .ThenBy(employee => employee.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (employees, totalCount);
    }

    public async Task<object> GetDashboardSummaryAsync()
    {
        var employees = _context.Employees.AsNoTracking();

        var employeeCount = await employees.CountAsync();

        var departmentCount = await employees
            .Where(employee =>
                employee.Department != null &&
                employee.Department != "")
            .Select(employee => employee.Department)
            .Distinct()
            .CountAsync();

        var countryHeadcount = await employees
            .Where(employee =>
                employee.Country != null &&
                employee.Country != "")
            .GroupBy(employee => employee.Country)
            .Select(group => new
            {
                country = group.Key,
                headcount = group.Count()
            })
            .OrderByDescending(item => item.headcount)
            .ToListAsync();

        var departmentHeadcount = await employees
            .Where(employee =>
                employee.Department != null &&
                employee.Department != "")
            .GroupBy(employee => employee.Department)
            .Select(group => new
            {
                department = group.Key,
                headcount = group.Count()
            })
            .OrderByDescending(item => item.headcount)
            .ToListAsync();

        var salaryByCurrency = await employees
            .Where(employee =>
                employee.Currency != null &&
                employee.Currency != "")
            .GroupBy(employee => employee.Currency)
            .Select(group => new
            {
                currency = group.Key,
                employeeCount = group.Count(),
                totalBasicSalary = group.Sum(employee => employee.BasicSalary),
                averageBasicSalary = group.Average(employee => employee.BasicSalary)
            })
            .OrderBy(item => item.currency)
            .ToListAsync();

        return new
        {
            employeeCount,
            departmentCount,
            countryHeadcount,
            departmentHeadcount,
            salaryByCurrency
        };
    }

    public async Task<Employee?> GetByIdAsync(int id)
    {
        return await _context.Employees.FindAsync(id);
    }

    public async Task<Employee?> GetByEmailAsync(string email)
    {
        var normalizedEmail = email.Trim().ToLower();

        return await _context.Employees.FirstOrDefaultAsync(
            employee => employee.Email.ToLower() == normalizedEmail);
    }

    public async Task<Employee> CreateAsync(Employee employee)
    {
        employee.Email = employee.Email.Trim();

        _context.Employees.Add(employee);
        await _context.SaveChangesAsync();

        return employee;
    }

    public async Task<bool> UpdateAsync(
        int id,
        Employee updatedEmployee)
    {
        var employee = await _context.Employees.FindAsync(id);

        if (employee == null)
            return false;

        employee.Name = updatedEmployee.Name;
        employee.Email = updatedEmployee.Email.Trim();
        employee.Department = updatedEmployee.Department;
        employee.Country = updatedEmployee.Country;
        employee.JobTitle = updatedEmployee.JobTitle;
        employee.BasicSalary = updatedEmployee.BasicSalary;
        employee.Currency = updatedEmployee.Currency;

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
