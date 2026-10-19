
using AcmeSalary.Api.Data;
using AcmeSalary.Api.Models;
using AcmeSalary.Api.Services;
using Microsoft.EntityFrameworkCore;

namespace AcmeSalary.Tests;

public class EmployeeServiceTests
{
    [Fact]
    public async Task CreateAsync_WithValidEmployee_SavesEmployee()
    {
        // Arrange: Create a separate in-memory database.
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        await using var context = new AppDbContext(options);
        var employeeService = new EmployeeService(context);

        var employee = new Employee
        {
            Name = "Rahul Sharma",
            Email = "rahul@example.com",
            Department = "IT",
            BasicSalary = 50000m
        };

        // Act: Save the employee through the service.
        var result = await employeeService.CreateAsync(employee);

        // Assert: Verify the employee was saved.
        Assert.True(result.Id > 0);
        Assert.Equal("Rahul Sharma", result.Name);
        Assert.Equal("rahul@example.com", result.Email);
        Assert.Equal(50000m, result.BasicSalary);

        var savedEmployee = await context.Employees.FindAsync(result.Id);
        Assert.NotNull(savedEmployee);
    }
    
    [Fact]
    public async Task GetAllAsync_WithMultipleEmployees_ReturnsAllEmployees()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        await using var context = new AppDbContext(options);

        context.Employees.AddRange(
            new Employee
            {
                Name = "Rahul Sharma",
                Email = "rahul@example.com",
                Department = "IT",
                BasicSalary = 50000m
            },
            new Employee
            {
                Name = "Priya Patel",
                Email = "priya@example.com",
                Department = "HR",
                BasicSalary = 40000m
            });

        await context.SaveChangesAsync();

        var employeeService = new EmployeeService(context);

        // Act
        var result = await employeeService.GetAllAsync();

        // Assert
        Assert.Equal(2, result.Count);
        Assert.Contains(result, employee => employee.Name == "Rahul Sharma");
        Assert.Contains(result, employee => employee.Name == "Priya Patel");
    }
    
    [Fact]
    public async Task GetByIdAsync_WithExistingEmployee_ReturnsEmployee()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        await using var context = new AppDbContext(options);

        var employee = new Employee
        {
            Name = "Rahul Sharma",
            Email = "rahul@example.com",
            Department = "IT",
            BasicSalary = 50000m
        };

        context.Employees.Add(employee);
        await context.SaveChangesAsync();

        var employeeService = new EmployeeService(context);

        // Act
        var result = await employeeService.GetByIdAsync(employee.Id);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(employee.Id, result.Id);
        Assert.Equal("Rahul Sharma", result.Name);
    }

    [Fact]
    public async Task GetByIdAsync_WithNonExistingEmployee_ReturnsNull()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        await using var context = new AppDbContext(options);
        var employeeService = new EmployeeService(context);

        // Act
        var result = await employeeService.GetByIdAsync(999);

        // Assert
        Assert.Null(result);
    }
    
    [Fact]
    public async Task UpdateAsync_WithExistingEmployee_UpdatesEmployee()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        await using var context = new AppDbContext(options);

        var employee = new Employee
        {
            Name = "Rahul Sharma",
            Email = "rahul@example.com",
            Department = "IT",
            BasicSalary = 50000m
        };

        context.Employees.Add(employee);
        await context.SaveChangesAsync();

        var employeeService = new EmployeeService(context);

        var updatedEmployee = new Employee
        {
            Name = "Rahul Sharma",
            Email = "rahul.updated@example.com",
            Department = "Finance",
            BasicSalary = 60000m
        };

        // Act
        var result = await employeeService.UpdateAsync(
            employee.Id, updatedEmployee);

        // Assert
        Assert.True(result);

        var savedEmployee = await context.Employees.FindAsync(employee.Id);

        Assert.NotNull(savedEmployee);
        Assert.Equal("rahul.updated@example.com", savedEmployee.Email);
        Assert.Equal("Finance", savedEmployee.Department);
        Assert.Equal(60000m, savedEmployee.BasicSalary);
    }
    
    [Fact]
    public async Task DeleteAsync_WithExistingEmployee_DeletesEmployee()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        await using var context = new AppDbContext(options);

        var employee = new Employee
        {
            Name = "Rahul Sharma",
            Email = "rahul@example.com",
            Department = "IT",
            BasicSalary = 50000m
        };

        context.Employees.Add(employee);
        await context.SaveChangesAsync();

        var employeeService = new EmployeeService(context);

        // Act
        var result = await employeeService.DeleteAsync(employee.Id);

        // Assert
        Assert.True(result);
        Assert.Null(await context.Employees.FindAsync(employee.Id));
    }
    
    [Fact]
    public async Task UpdateAsync_WithNonExistingEmployee_ReturnsFalse()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        await using var context = new AppDbContext(options);
        var employeeService = new EmployeeService(context);

        var employee = new Employee
        {
            Name = "Rahul Sharma",
            Email = "rahul@example.com",
            Department = "IT",
            BasicSalary = 50000m
        };

        // Act
        var result = await employeeService.UpdateAsync(999, employee);

        // Assert
        Assert.False(result);
    }

    [Fact]
    public async Task DeleteAsync_WithNonExistingEmployee_ReturnsFalse()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        await using var context = new AppDbContext(options);
        var employeeService = new EmployeeService(context);

        // Act
        var result = await employeeService.DeleteAsync(999);

        // Assert
        Assert.False(result);
    }





}
