# Acme Salary Management

A full-stack employee and salary management application built using **ASP.NET Core Web API, Entity Framework Core, SQLite, and React**.

The application supports employee management, salary calculations, and automated testing.

## Features

- **Employee Management:** Create, view, update, and delete employee records.
- **Salary Calculation:** Calculate HRA, other allowances, deductions, gross salary, and net salary.
- **Input Validation:** Validate employee details before saving.
- **REST API:** Expose employee and salary endpoints through ASP.NET Core Web API.
- **Database Integration:** Store employee records using SQLite and Entity Framework Core.
- **Automated Testing:** Test application services using xUnit.

## Technology Stack

| Area | Technologies |
|---|---|
| Backend | C#, ASP.NET Core Web API |
| Frontend | React, JavaScript, Vite |
| Database | SQLite |
| ORM | Entity Framework Core |
| Testing | xUnit |
| Version Control | Git, GitHub |

## Salary Calculation

The application uses the following demonstration rules:

- HRA = 40% of basic salary
- Other allowance = 10% of basic salary
- Deductions = 5% of basic salary
- Gross salary = Basic salary + HRA + Other allowance
- Net salary = Gross salary − Deductions

**Note:** These are demonstration calculations and are not intended to represent statutory payroll or tax calculations.

## Project Structure

```text
AcmeSalaryManagement/
├── AcmeSalary.Api/
│   ├── Controllers/
│   ├── Models/
│   ├── Services/
│   └── acme-salary-frontend/
├── AcmeSalary.Tests/
├── AcmeSalaryManagement.slnx
├── .gitignore
├── README.md
└── requirements.md
```

## Prerequisites

Install the following before running the application:

- .NET 10 SDK
- Node.js and npm
- Git

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/bhagyashri-debuggs/AcmeSalaryManagement.git
cd AcmeSalaryManagement
```

### 2. Run the backend API

Open a terminal in the repository folder and run:

```bash
cd AcmeSalary.Api
dotnet restore
dotnet run --urls http://localhost:5185
```

The API should be available at:

`http://localhost:5185`

To view employee records, open:

`http://localhost:5185/api/employees`

### 3. Run the React frontend

Open a **second terminal** from the repository root and run:

```bash
cd AcmeSalary.Api/acme-salary-frontend
npm install
npm run dev
```

Open the frontend in your browser:

`http://localhost:5173`

Keep both terminals running while using the application.

## Running Tests

From the repository root, run:

```bash
dotnet test
```

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/employees` | Retrieve all employees |
| GET | `/api/employees/{id}` | Retrieve an employee |
| POST | `/api/employees` | Create an employee |
| PUT | `/api/employees/{id}` | Update an employee |
| DELETE | `/api/employees/{id}` | Delete an employee |
| GET | `/api/salary/{employeeId}` | Calculate salary details |

## Future Enhancements

- Authentication and role-based authorization
- Improved payroll reporting
- Deployment to a cloud platform
- Continuous integration and automated build validation

## Author

**Bhagyashri Kamble**

Full-stack development portfolio project.
