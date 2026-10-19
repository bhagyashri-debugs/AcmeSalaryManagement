
using AcmeSalary.Api.Models;
using AcmeSalary.Api.Services;

namespace AcmeSalary.Tests;

public class SalaryServiceTests
{
    [Fact]
    public void CalculateSalary_WithBasicSalary50000_ReturnsCorrectSalary()
    {
        // Arrange
        var employee = new Employee
        {
            Id = 1,
            Name = "Rahul Sharma",
            Email = "rahul@example.com",
            Department = "IT",
            BasicSalary = 50000m
        };

        var salaryService = new SalaryService();

        // Act
        var result = salaryService.CalculateSalary(employee);

        // Assert
        Assert.Equal(50000m, result.BasicSalary);
        Assert.Equal(20000m, result.HRA);
        Assert.Equal(5000m, result.OtherAllowance);
        Assert.Equal(75000m, result.GrossSalary);
        Assert.Equal(2500m, result.Deductions);
        Assert.Equal(72500m, result.NetSalary);
    }

    [Theory]
    [InlineData(10000, 14500)]
    [InlineData(40000, 58000)]
    [InlineData(80000, 116000)]
    public void CalculateSalary_WithDifferentBasicSalaries_ReturnsCorrectNetSalary(
        decimal basicSalary, decimal expectedNetSalary)
    {
        // Arrange
        var employee = new Employee
        {
            BasicSalary = basicSalary
        };

        var salaryService = new SalaryService();

        // Act
        var result = salaryService.CalculateSalary(employee);

        // Assert
        Assert.Equal(expectedNetSalary, result.NetSalary);
    }

    [Fact]
    public void CalculateSalary_WithFractionalAmounts_PreservesDecimalPrecision()
    {
        // Arrange
        var employee = new Employee
        {
            BasicSalary = 1000.01m
        };

        var salaryService = new SalaryService();

        // Act
        var result = salaryService.CalculateSalary(employee);

        // Assert
        Assert.Equal(1450.0145m, result.NetSalary);
    }
    
    
    [Theory]
    [InlineData(0)]
    [InlineData(-1000)]
    public void CalculateSalary_WithInvalidBasicSalary_ThrowsException(
        decimal basicSalary)
    {
        // Arrange
        var employee = new Employee
        {
            BasicSalary = basicSalary
        };

        var salaryService = new SalaryService();

        // Act
        var exception = Assert.Throws<ArgumentOutOfRangeException>(
            () => salaryService.CalculateSalary(employee));

        // Assert
        Assert.Equal(
            "Basic salary must be greater than zero.",
            exception.Message.Split(" (Parameter")[0]);
    }

}
