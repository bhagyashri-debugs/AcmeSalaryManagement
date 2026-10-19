
using AcmeSalary.Api.Models;

namespace AcmeSalary.Api.Services;

public class SalaryService
{
    public SalaryDetails CalculateSalary(Employee employee)
    {
        if (employee.BasicSalary <= 0)
{
        throw new ArgumentOutOfRangeException(
        nameof(employee.BasicSalary),
        "Basic salary must be greater than zero.");
}
        decimal basicSalary = employee.BasicSalary;

        decimal hra = basicSalary * 0.40m;
        decimal otherAllowance = basicSalary * 0.10m;
        decimal grossSalary = basicSalary + hra + otherAllowance;
        decimal deductions = basicSalary * 0.05m;
        decimal netSalary = grossSalary - deductions;

        return new SalaryDetails
        {
            EmployeeId = employee.Id,
            BasicSalary = basicSalary,
            HRA = hra,
            OtherAllowance = otherAllowance,
            GrossSalary = grossSalary,
            Deductions = deductions,
            NetSalary = netSalary
        };
    }
}
