# Acme Salary Management

A full-stack employee and salary management application built with ASP.NET Core Web API, Entity Framework Core, SQLite, and React.

## Features

- Create, view, update, and delete employee records.
- Validate employee information, including name, email, department, and basic salary.
- Prevent duplicate email addresses through application-level checks.
- Calculate and display salary breakdowns.
- Persist employee data using SQLite.
- Run automated backend tests with xUnit.

## Technology Stack

**Backend**
- C# and ASP.NET Core Web API (.NET 10)
- Entity Framework Core
- SQLite
- Dependency injection and asynchronous service methods

**Frontend**
- React
- Vite
- JavaScript, HTML, and CSS

**Testing**
- xUnit
- Automated service and salary calculation tests

## Application Architecture

The React frontend communicates with the ASP.NET Core Web API over HTTP. The API controllers delegate employee operations to services, which use Entity Framework Core to access the SQLite database.

```text
React + Vite
     |
     | HTTP requests
     v
ASP.NET Core Web API
     |
     v
Employee and Salary Services
     |
     v
Entity Framework Core
     |
     v
SQLite Database
```

## Prerequisites

- .NET 10 SDK
- Node.js and npm

## Run the Backend

Open a terminal in the solution root and run:

```powershell
dotnet run --project .\AcmeSalary.Api
```

Use the listening URL shown in the terminal. The development API in this project has been tested at `http://localhost:5185`.

The employee endpoints are available at `/api/employees`.

## Run the Frontend

Open a second terminal and run:

```powershell
cd .\AcmeSalary.Api\acme-salary-frontend
npm.cmd install
npm.cmd run dev
```

Open the frontend URL shown in the terminal. The development frontend has been tested at `http://localhost:5173`.

## Run Automated Tests

From the solution root:

```powershell
dotnet test
```

The current test suite has 16 passing tests.

## Salary Calculation

The application uses the following demonstration formulas:

- HRA = 40% of basic salary
- Other allowance = 10% of basic salary
- Deductions = 5% of basic salary
- Gross salary = basic salary + HRA + other allowance
- Net salary = gross salary − deductions

These are demonstration rules for this project, not statutory payroll or tax calculations.

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/employees` | List employees |
| GET | `/api/employees/{id}` | Get one employee |
| POST | `/api/employees` | Create an employee |
| PUT | `/api/employees/{id}` | Update an employee |
| DELETE | `/api/employees/{id}` | Delete an employee |
| GET | `/api/salary/{employeeId}` | Calculate salary breakdown |

## Current Verification

- Backend build: successful
- Automated tests: 16 passed in the last reported run
- Frontend production build: successful

## Notes

- Configure the frontend API URL and backend CORS policy consistently when running in a different environment.
- Duplicate-email checks are implemented in the application layer. A database unique constraint should be added after existing duplicate records are cleaned up for stronger data integrity.
- Do not commit credentials, personal employee data, or local database files containing sensitive information.