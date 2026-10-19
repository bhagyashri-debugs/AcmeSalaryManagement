
using AcmeSalary.Api.Models;

namespace AcmeSalary.Api.Services;

public interface IEmployeeService
{
    Task<List<Employee>> GetAllAsync();

    Task<Employee?> GetByIdAsync(int id);

    Task<Employee?> GetByEmailAsync(string email);

    Task<Employee> CreateAsync(Employee employee);

    Task<bool> UpdateAsync(int id, Employee updatedEmployee);

    Task<bool> DeleteAsync(int id);
}
