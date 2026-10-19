
using AcmeSalary.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace AcmeSalary.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<Employee> Employees => Set<Employee>();
}
