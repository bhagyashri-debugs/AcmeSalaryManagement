
using AcmeSalary.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace AcmeSalary.Api.Data;

public static class EmployeeSeeder
{
    private const int TargetEmployeeCount = 10_000;

    private static readonly string[] FirstNames =
    [
        "Aarav", "Aditi", "Arjun", "Ananya", "Dev", "Diya",
        "Ishaan", "Isha", "Kabir", "Kavya", "Neel", "Priya",
        "Rahul", "Riya", "Vikram", "Zoya"
    ];

    private static readonly string[] LastNames =
    [
        "Sharma", "Patel", "Singh", "Kumar", "Shah", "Mehta",
        "Rao", "Nair", "Joshi", "Gupta", "Desai", "Verma"
    ];

    private static readonly string[] Departments =
    [
        "Engineering", "Human Resources", "Finance",
        "Sales", "Marketing", "Operations", "IT"
    ];

    private static readonly string[] JobTitles =
    [
        "Software Engineer", "Senior Software Engineer",
        "HR Manager", "Financial Analyst", "Sales Executive",
        "Marketing Specialist", "Operations Manager",
        "IT Support Analyst", "Team Lead", "Data Analyst"
    ];

    private static readonly (string Country, string Currency)[] Locations =
    [
        ("India", "INR"),
        ("United States", "USD"),
        ("United Kingdom", "GBP"),
        ("Canada", "CAD"),
        ("Australia", "AUD"),
        ("Germany", "EUR"),
        ("Singapore", "SGD")
    ];

    public static async Task SeedAsync(AppDbContext context)
    {
        var existingEmployees = await context.Employees
            .OrderBy(employee => employee.Id)
            .ToListAsync();

        // Repair missing values without replacing existing employee details.
        foreach (var employee in existingEmployees)
        {
            var location = Locations[(employee.Id - 1) % Locations.Length];

            if (string.IsNullOrWhiteSpace(employee.Country))
            {
                employee.Country = location.Country;
            }

            if (string.IsNullOrWhiteSpace(employee.JobTitle))
            {
                employee.JobTitle = JobTitles[
                    (employee.Id - 1) % JobTitles.Length];
            }

            if (string.IsNullOrWhiteSpace(employee.Currency))
            {
                employee.Currency = location.Currency;
            }
        }

        var currentCount = existingEmployees.Count;

        if (currentCount >= TargetEmployeeCount)
        {
            if (context.ChangeTracker.HasChanges())
            {
                await context.SaveChangesAsync();
            }

            return;
        }

        var emailSet = new HashSet<string>(
            existingEmployees.Select(employee => employee.Email),
            StringComparer.OrdinalIgnoreCase);

        var employeesToAdd = new List<Employee>(
            TargetEmployeeCount - currentCount);

        // Start with the first candidate every time to keep the generated
        // dataset deterministic. Existing emails are skipped.
        var candidate = 1;

        while (currentCount + employeesToAdd.Count < TargetEmployeeCount)
        {
            var index = candidate - 1;
            candidate++;

            var email = $"seed.employee{index + 1:D5}@acme.example";

            if (!emailSet.Add(email))
            {
                continue;
            }

            var location = Locations[index % Locations.Length];
            var firstName = FirstNames[index % FirstNames.Length];
            var lastName = LastNames[
                (index / FirstNames.Length) % LastNames.Length];

            employeesToAdd.Add(new Employee
            {
                Name = $"{firstName} {lastName}",
                Email = email,
                Department = Departments[index % Departments.Length],
                Country = location.Country,
                JobTitle = JobTitles[index % JobTitles.Length],
                Currency = location.Currency,
                BasicSalary = 30_000m + (index % 70) * 1_000m
            });
        }

        context.Employees.AddRange(employeesToAdd);

        await context.SaveChangesAsync();
    }
}
