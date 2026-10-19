
namespace AcmeSalary.Api.Models;

public class SalaryDetails
{
    public int EmployeeId { get; set; }

    public decimal BasicSalary { get; set; }

    public decimal HRA { get; set; }

    public decimal OtherAllowance { get; set; }

    public decimal GrossSalary { get; set; }

    public decimal Deductions { get; set; }

    public decimal NetSalary { get; set; }
}
