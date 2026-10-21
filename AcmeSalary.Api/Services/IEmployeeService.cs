
using AcmeSalary.Api.Models;

namespace AcmeSalary.Api.Services;

public interface IEmployeeService
{
    Task<List<Employee>> GetAllAsync();

    Task<(List<Employee> Employees, int TotalCount)> GetPagedAsync(
        int page,
        int pageSize,
        string? search = null,
        string? country = null,
        string? department = null,
        string? jobTitle = null,
        string? sortBy = null,
        string? sortOrder = null);

    Task<object> GetDashboardSummaryAsync();

    Task<Employee?> GetByIdAsync(int id);

    Task<Employee?> GetByEmailAsync(string email);

    Task<Employee> CreateAsync(Employee employee);

    Task<bool> UpdateAsync(int id, Employee updatedEmployee);

    Task<bool> DeleteAsync(int id);
}
